/// <reference types="../src/global.d.ts" />

import { randomUUID } from 'node:crypto';

import { INestApplication } from '@nestjs/common';
import type { TestFn } from 'ava';
import ava from 'ava';
import Sinon from 'sinon';

import { AuthService } from '../src/core/auth';
import { WorkspaceModule } from '../src/core/workspaces';
import { ConfigModule } from '../src/fundamentals/config';
import { CopilotModule } from '../src/plugins/copilot';
import { PromptService } from '../src/plugins/copilot/prompt';
import {
  CopilotProviderService,
  registerCopilotProvider,
} from '../src/plugins/copilot/providers';
import { CopilotStorage } from '../src/plugins/copilot/storage';
import {
  acceptInviteById,
  createTestingApp,
  createWorkspace,
  inviteUser,
  signUp,
} from './utils';
import {
  chatWithImages,
  chatWithText,
  chatWithTextStream,
  createCopilotMessage,
  createCopilotSession,
  getHistories,
  MockCopilotTestProvider,
  textToEventStream,
} from './utils/copilot';

const test = ava as TestFn<{
  auth: AuthService;
  app: INestApplication;
  prompt: PromptService;
  provider: CopilotProviderService;
  storage: CopilotStorage;
}>;

test.beforeEach(async t => {
  const { app } = await createTestingApp({
    imports: [
      ConfigModule.forRoot({
        plugins: {
          copilot: {
            openai: {
              apiKey: '1',
            },
            fal: {
              apiKey: '1',
            },
          },
        },
      }),
      WorkspaceModule,
      CopilotModule,
    ],
  });

  const auth = app.get(AuthService);
  const prompt = app.get(PromptService);
  const storage = app.get(CopilotStorage);

  t.context.app = app;
  t.context.auth = auth;
  t.context.prompt = prompt;
  t.context.storage = storage;
});

let token: string;
const promptName = 'prompt';
test.beforeEach(async t => {
  const { app, prompt } = t.context;
  const user = await signUp(app, 'test', 'darksky@affine.pro', '123456');
  token = user.token.token;

  registerCopilotProvider(MockCopilotTestProvider);

  await prompt.set(promptName, 'test', [
    { role: 'system', content: 'hello {{word}}' },
  ]);
});

test.afterEach.always(async t => {
  await t.context.app.close();
});

// ==================== session ====================

test('should create session correctly', async t => {
  const { app } = t.context;

  const assertCreateSession = async (
    workspaceId: string,
    error: string,
    asserter = async (x: any) => {
      t.truthy(await x, error);
    }
  ) => {
    await asserter(
      createCopilotSession(app, token, workspaceId, randomUUID(), promptName)
    );
  };

  {
    const { id } = await createWorkspace(app, token);
    await assertCreateSession(
      id,
      'should be able to create session with cloud workspace that user can access'
    );
  }

  {
    await assertCreateSession(
      randomUUID(),
      'should be able to create session with local workspace'
    );
  }

  {
    const {
      token: { token },
    } = await signUp(app, 'test', 'test@affine.pro', '123456');
    const { id } = await createWorkspace(app, token);
    await assertCreateSession(id, '', async x => {
      await t.throwsAsync(
        x,
        { instanceOf: Error },
        'should not able to create session with cloud workspace that user cannot access'
      );
    });

    const inviteId = await inviteUser(
      app,
      token,
      id,
      'darksky@affine.pro',
      'Admin'
    );
    await acceptInviteById(app, id, inviteId, false);
    await assertCreateSession(
      id,
      'should able to create session after user have permission'
    );
  }
});

test('should be able to use test provider', async t => {
  const { app } = t.context;

  const { id } = await createWorkspace(app, token);
  t.truthy(
    await createCopilotSession(app, token, id, randomUUID(), promptName),
    'failed to create session'
  );
});

// ==================== message ====================

test('should create message correctly', async t => {
  const { app } = t.context;

  {
    const { id } = await createWorkspace(app, token);
    const sessionId = await createCopilotSession(
      app,
      token,
      id,
      randomUUID(),
      promptName
    );
    const messageId = await createCopilotMessage(app, token, sessionId);
    t.truthy(messageId, 'should be able to create message with valid session');
  }

  {
    await t.throwsAsync(
      createCopilotMessage(app, token, randomUUID()),
      { instanceOf: Error },
      'should not able to create message with invalid session'
    );
  }
});

// ==================== chat ====================

test('should be able to chat with api', async t => {
  const { app, storage } = t.context;

  Sinon.stub(storage, 'handleRemoteLink').resolvesArg(2);

  const { id } = await createWorkspace(app, token);
  const sessionId = await createCopilotSession(
    app,
    token,
    id,
    randomUUID(),
    promptName
  );
  const messageId = await createCopilotMessage(app, token, sessionId);
  const ret = await chatWithText(app, token, sessionId, messageId);
  t.is(ret, 'generate text to text', 'should be able to chat with text');

  const ret2 = await chatWithTextStream(app, token, sessionId, messageId);
  t.is(
    ret2,
    textToEventStream('generate text to text stream', messageId),
    'should be able to chat with text stream'
  );

  const ret3 = await chatWithImages(app, token, sessionId, messageId);
  t.is(
    ret3,
    textToEventStream(
      ['https://example.com/image.jpg'],
      messageId,
      'attachment'
    ),
    'should be able to chat with images'
  );

  Sinon.restore();
});

test('should reject message from different session', async t => {
  const { app } = t.context;

  const { id } = await createWorkspace(app, token);
  const sessionId = await createCopilotSession(
    app,
    token,
    id,
    randomUUID(),
    promptName
  );
  const anotherSessionId = await createCopilotSession(
    app,
    token,
    id,
    randomUUID(),
    promptName
  );
  const anotherMessageId = await createCopilotMessage(
    app,
    token,
    anotherSessionId
  );
  await t.throwsAsync(
    chatWithText(app, token, sessionId, anotherMessageId),
    { instanceOf: Error },
    'should reject message from different session'
  );
});

test('should reject request from different user', async t => {
  const { app } = t.context;

  const { id } = await createWorkspace(app, token);
  const sessionId = await createCopilotSession(
    app,
    token,
    id,
    randomUUID(),
    promptName
  );

  // should reject message from different user
  {
    const { token } = await signUp(app, 'a1', 'a1@affine.pro', '123456');
    await t.throwsAsync(
      createCopilotMessage(app, token.token, sessionId),
      { instanceOf: Error },
      'should reject message from different user'
    );
  }

  // should reject chat from different user
  {
    const messageId = await createCopilotMessage(app, token, sessionId);
    {
      const { token } = await signUp(app, 'a2', 'a2@affine.pro', '123456');
      await t.throwsAsync(
        chatWithText(app, token.token, sessionId, messageId),
        { instanceOf: Error },
        'should reject chat from different user'
      );
    }
  }
});

// ==================== history ====================

test('should be able to list history', async t => {
  const { app } = t.context;

  const { id: workspaceId } = await createWorkspace(app, token);
  const sessionId = await createCopilotSession(
    app,
    token,
    workspaceId,
    randomUUID(),
    promptName
  );

  const messageId = await createCopilotMessage(app, token, sessionId);
  await chatWithText(app, token, sessionId, messageId);

  const histories = await getHistories(app, token, { workspaceId });
  t.deepEqual(
    histories.map(h => h.messages.map(m => m.content)),
    [['generate text to text']],
    'should be able to list history'
  );
});

test('should reject request that user have not permission', async t => {
  const { app } = t.context;

  const {
    token: { token: anotherToken },
  } = await signUp(app, 'a1', 'a1@affine.pro', '123456');
  const { id: workspaceId } = await createWorkspace(app, anotherToken);

  // should reject request that user have not permission
  {
    await t.throwsAsync(
      getHistories(app, token, { workspaceId }),
      { instanceOf: Error },
      'should reject request that user have not permission'
    );
  }

  // should able to list history after user have permission
  {
    const inviteId = await inviteUser(
      app,
      anotherToken,
      workspaceId,
      'darksky@affine.pro',
      'Admin'
    );
    await acceptInviteById(app, workspaceId, inviteId, false);

    t.deepEqual(
      await getHistories(app, token, { workspaceId }),
      [],
      'should able to list history after user have permission'
    );
  }

  {
    const sessionId = await createCopilotSession(
      app,
      anotherToken,
      workspaceId,
      randomUUID(),
      promptName
    );

    const messageId = await createCopilotMessage(app, anotherToken, sessionId);
    await chatWithText(app, anotherToken, sessionId, messageId);

    const histories = await getHistories(app, anotherToken, { workspaceId });
    t.deepEqual(
      histories.map(h => h.messages.map(m => m.content)),
      [['generate text to text']],
      'should able to list history'
    );

    t.deepEqual(
      await getHistories(app, token, { workspaceId }),
      [],
      'should not list history created by another user'
    );
  }
});
