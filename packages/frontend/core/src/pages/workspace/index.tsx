import { useWorkspace } from '@affine/core/hooks/use-workspace';
import { ZipTransformer } from '@blocksuite/blocks';
import type { Workspace } from '@toeverything/infra';
import {
  FrameworkScope,
  GlobalContextService,
  useLiveData,
  useService,
  WorkspacesService,
} from '@toeverything/infra';
import type { ReactElement } from 'react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AffineErrorBoundary } from '../../components/affine/affine-error-boundary';
import { WorkspaceFallback } from '../../components/workspace';
import { WorkspaceLayout } from '../../layouts/workspace-layout';
import { RightSidebarContainer } from '../../modules/right-sidebar';
import { WorkbenchRoot } from '../../modules/workbench';
import { AllWorkspaceModals } from '../../providers/modal-provider';
import { performanceRenderLogger } from '../../shared';
import { PageNotFound } from '../404';

declare global {
  /**
   * @internal debug only
   */
  // eslint-disable-next-line no-var
  var currentWorkspace: Workspace | undefined;
  // eslint-disable-next-line no-var
  var exportWorkspaceSnapshot: () => Promise<void>;
  interface WindowEventMap {
    'affine:workspace:change': CustomEvent<{ id: string }>;
  }
}

export const Component = (): ReactElement => {
  performanceRenderLogger.info('WorkspaceLayout');

  const params = useParams();

  const [showNotFound, setShowNotFound] = useState(false);
  const workspacesService = useService(WorkspacesService);
  const listLoading = useLiveData(workspacesService.list.isLoading$);
  const workspaces = useLiveData(workspacesService.list.workspaces$);

  const meta = useMemo(() => {
    return workspaces.find(({ id }) => id === params.workspaceId);
  }, [workspaces, params.workspaceId]);

  const workspace = useWorkspace(meta);
  const globalContext = useService(GlobalContextService).globalContext;

  useEffect(() => {
    workspacesService.list.revalidate();
  }, [workspacesService]);

  useEffect(() => {
    if (workspace) {
      // for debug purpose
      window.currentWorkspace = workspace ?? undefined;
      window.dispatchEvent(
        new CustomEvent('affine:workspace:change', {
          detail: {
            id: workspace.id,
          },
        })
      );
      window.exportWorkspaceSnapshot = async () => {
        const zip = await ZipTransformer.exportDocs(
          workspace.docCollection,
          Array.from(workspace.docCollection.docs.values()).map(collection =>
            collection.getDoc()
          )
        );
        const url = URL.createObjectURL(zip);
        // download url
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workspace.docCollection.meta.name}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      };
      localStorage.setItem('last_workspace_id', workspace.id);
      globalContext.workspaceId.set(workspace.id);
      return () => {
        window.currentWorkspace = undefined;
        globalContext.workspaceId.set(null);
      };
    }
    return;
  }, [globalContext, meta, workspace]);

  //  avoid doing operation, before workspace is loaded
  const isRootDocReady =
    useLiveData(workspace?.engine.rootDocState$.map(v => v.ready)) ?? false;

  // if listLoading is false, we can show 404 page, otherwise we should show loading page.
  useEffect(() => {
    if (listLoading === false && meta === undefined) {
      setShowNotFound(true);
    }
    if (meta) {
      setShowNotFound(false);
    }
  }, [listLoading, meta, workspacesService]);

  useEffect(() => {
    if (showNotFound) {
      const timer = setInterval(() => {
        workspacesService.list.revalidate();
      }, 3000);
      return () => {
        clearInterval(timer);
      };
    }
    return;
  }, [showNotFound, workspacesService]);

  if (showNotFound) {
    return <PageNotFound noPermission />;
  }
  if (!workspace) {
    return <WorkspaceFallback key="workspaceLoading" />;
  }

  if (!isRootDocReady) {
    return (
      <FrameworkScope scope={workspace.scope}>
        <WorkspaceFallback key="workspaceLoading" />
        <AllWorkspaceModals />
      </FrameworkScope>
    );
  }

  return (
    <FrameworkScope scope={workspace.scope}>
      <Suspense fallback={<WorkspaceFallback key="workspaceFallback" />}>
        <AffineErrorBoundary height="100vh">
          <WorkspaceLayout>
            <WorkbenchRoot />
            <RightSidebarContainer />
          </WorkspaceLayout>
        </AffineErrorBoundary>
      </Suspense>
    </FrameworkScope>
  );
};
