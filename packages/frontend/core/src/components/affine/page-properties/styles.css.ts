import { cssVar } from '@toeverything/theme';
import { createVar, globalStyle, style } from '@vanilla-extract/css';

const propertyNameCellWidth = createVar();

export const root = style({
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
  vars: {
    [propertyNameCellWidth]: '160px',
  },
});

export const rootCentered = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
  maxWidth: cssVar('editorWidth'),
  padding: `0 ${cssVar('editorSidePadding', '24px')}`,
});

export const tableHeader = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

export const tableHeaderInfoRow = style({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: cssVar('textSecondaryColor'),
  fontSize: cssVar('fontSm'),
  fontWeight: 500,
});

export const tableHeaderSecondaryRow = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  color: cssVar('textPrimaryColor'),
  fontSize: cssVar('fontSm'),
  fontWeight: 500,
  padding: '0 6px',
  gap: '8px',
});

export const pageInfoDimmed = style({
  color: cssVar('textSecondaryColor'),
});

export const spacer = style({
  flexGrow: 1,
});

export const tableHeaderBacklinksHint = style({
  padding: '6px',
  cursor: 'pointer',
  borderRadius: '4px',
  ':hover': {
    backgroundColor: cssVar('hoverColor'),
  },
});

export const backlinksList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  fontSize: cssVar('fontSm'),
});

export const tableHeaderTimestamp = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
  cursor: 'default',
  padding: '0 6px',
});

export const tableHeaderDivider = style({
  height: '1px',
  width: '100%',
  margin: '8px 0',
  backgroundColor: cssVar('dividerColor'),
});

export const tableBodyRoot = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const tableBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

export const addPropertyButton = style({
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'flex-start',
  fontSize: cssVar('fontSm'),
  color: `${cssVar('textSecondaryColor')} !important`,
  padding: '6px 4px',
  cursor: 'pointer',
  ':hover': {
    color: cssVar('textPrimaryColor'),
    backgroundColor: cssVar('hoverColor'),
  },
  marginTop: '8px',
});

export const collapsedIcon = style({
  transition: 'transform 0.2s ease-in-out',
  selectors: {
    '&[data-collapsed="true"]': {
      transform: 'rotate(90deg)',
    },
  },
});

export const propertyRow = style({
  display: 'flex',
  gap: 4,
  minHeight: 32,
  position: 'relative',
  selectors: {
    '&[data-dragging=true]': {
      backgroundColor: cssVar('hoverColor'),
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  },
});

export const draggableRow = style({
  cursor: 'pointer',
  selectors: {
    '&:before': {
      content: '""',
      display: 'block',
      position: 'absolute',
      top: '50%',
      borderRadius: '2px',
      backgroundColor: cssVar('placeholderColor'),
      transform: 'translate(-12px, -50%)',
      transition: 'all 0.2s 0.1s',
      opacity: 0,
      height: '4px',
      width: '4px',
      willChange: 'height, opacity',
    },
    '&[data-draggable=false]:before': {
      display: 'none',
    },
    '&:hover:before': {
      height: 12,
      opacity: 1,
    },
    '&:active:before': {
      height: '100%',
      width: '1px',
      borderRadius: 0,
      opacity: 1,
      transform: 'translate(-6px, -50%)',
    },
    '&[data-other-dragging=true]:before': {
      opacity: 0,
    },
    '&[data-other-dragging=true]': {
      pointerEvents: 'none',
    },
  },
});

export const draggableRowSetting = style([
  draggableRow,
  {
    selectors: {
      '&:active:before': {
        height: '100%',
        width: '1px',
        opacity: 1,
        transform: 'translate(-12px, -50%)',
      },
    },
  },
]);

export const propertyRowCell = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  position: 'relative',
  padding: 6,
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: cssVar('fontSm'),
  userSelect: 'none',
  ':focus-visible': {
    outline: 'none',
  },
  ':hover': {
    backgroundColor: cssVar('hoverColor'),
  },
});

export const propertyRowNameCell = style([
  propertyRowCell,
  draggableRow,
  {
    color: cssVar('textSecondaryColor'),
    width: propertyNameCellWidth,
    gap: 6,
  },
]);

export const propertyRowIconContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '2px',
  fontSize: 16,
  transition: 'transform 0.2s',
  color: 'inherit',
});

export const propertyRowName = style({
  flexGrow: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: cssVar('fontSm'),
});

export const propertyRowValueCell = style([
  propertyRowCell,
  {
    border: `1px solid transparent`,
    color: cssVar('textPrimaryColor'),
    ':focus': {
      backgroundColor: cssVar('hoverColor'),
    },
    '::placeholder': {
      color: cssVar('placeholderColor'),
    },
    selectors: {
      '&[data-empty="true"]': {
        color: cssVar('placeholderColor'),
      },
    },
    flex: 1,
  },
]);

export const propertyRowValueTextCell = style([
  propertyRowValueCell,
  {
    ':focus': {
      border: `1px solid ${cssVar('blue700')}`,
      boxShadow: cssVar('activeShadow'),
    },
  },
]);

export const menuHeader = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
  fontSize: cssVar('fontXs'),
  fontWeight: 500,
  color: cssVar('textSecondaryColor'),
  padding: '8px 16px',
  minWidth: 320,
  textTransform: 'uppercase',
});

export const menuItemListScrollable = style({
  maxHeight: 300,
});

export const menuItemListScrollbar = style({
  transform: 'translateX(4px)',
});

export const menuItemList = style({
  display: 'flex',
  flexDirection: 'column',
  maxHeight: 200,
  overflow: 'auto',
});

globalStyle(`${menuItemList}${menuItemList} > div`, {
  display: 'table !important',
});

export const menuItemIconContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'inherit',
});

export const menuItemName = style({
  flexGrow: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const checkboxProperty = style({
  fontSize: cssVar('fontH5'),
});

export const propertyNameIconEditable = style({
  fontSize: cssVar('fontH5'),
  borderRadius: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  flexShrink: 0,
  border: `1px solid ${cssVar('borderColor')}`,
  background: cssVar('backgroundSecondaryColor'),
});

export const propertyNameInput = style({
  fontSize: cssVar('fontSm'),
  borderRadius: 4,
  color: cssVar('textPrimaryColor'),
  background: 'none',
  border: `1px solid ${cssVar('borderColor')}`,
  outline: 'none',
  width: '100%',
  padding: 6,
});

globalStyle(
  `${propertyRow}:is([data-dragging=true], [data-other-dragging=true])
    :is(${propertyRowValueCell}, ${propertyRowNameCell})`,
  {
    pointerEvents: 'none',
  }
);

export const propertyRowNamePopupRow = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
  fontSize: cssVar('fontSm'),
  fontWeight: 500,
  color: cssVar('textSecondaryColor'),
  padding: '8px 16px',
  minWidth: 260,
});

export const propertySettingRow = style([
  draggableRowSetting,
  {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    fontSize: cssVar('fontSm'),
    padding: '0 12px',
    height: 32,
    position: 'relative',
  },
]);

export const propertySettingRowName = style({
  flexGrow: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: 200,
});

export const selectorButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
  gap: 8,
  fontSize: cssVar('fontSm'),
  fontWeight: 500,
  padding: '4px 8px',
  cursor: 'pointer',
  ':hover': {
    backgroundColor: cssVar('hoverColor'),
  },
});