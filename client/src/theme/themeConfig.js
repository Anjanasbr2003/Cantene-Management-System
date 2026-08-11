import { theme } from 'antd';

export const appleTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary:         '#0071e3',
    colorInfo:            '#0071e3',
    colorSuccess:         '#34c759',
    colorWarning:         '#ff9500',
    colorError:           '#ff3b30',
    colorBgBase:          '#fbfbfd',
    colorBgContainer:     '#ffffff',
    colorBgElevated:      '#ffffff',
    colorBgLayout:        '#f5f5f7',
    colorBorder:          '#d2d2d7',
    colorBorderSecondary: '#e8e8ed',
    colorTextBase:        '#1d1d1f',
    colorTextSecondary:   '#6e6e73',
    colorTextPlaceholder: '#86868b',
    borderRadius:         12,
    borderRadiusLG:       18,
    borderRadiusSM:       8,
    fontFamily:           "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
    fontSize:             14,
    fontSizeSM:           12,
    lineHeight:           1.47059,
    controlHeight:        40,
    controlHeightLG:      48,
    motionDurationMid:    '0.22s',
    motionEaseInOut:      'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  components: {
    Button: {
      colorPrimary:        '#0071e3',
      colorPrimaryHover:   '#0077ed',
      colorPrimaryActive:  '#006edb',
      borderRadius:        980,
      borderRadiusLG:      980,
      fontWeight:          500,
      controlHeight:       36,
      controlHeightLG:     44,
      paddingInline:       20,
      paddingInlineLG:     24,
      primaryShadow:       'none',
    },
    Card: {
      colorBgContainer: '#ffffff',
      borderRadiusLG:   18,
      paddingLG:        24,
    },
    Modal: {
      borderRadiusLG: 22,
    },
    Drawer: {
      colorBgElevated: '#ffffff',
    },
    Tabs: {
      itemColor:         '#6e6e73',
      itemSelectedColor: '#0071e3',
      itemHoverColor:    '#1d1d1f',
      inkBarColor:       '#0071e3',
      titleFontSize:     14,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      activeBorderColor: '#0071e3',
      hoverBorderColor: '#86868b',
    },
    Select: {
      borderRadius: 8,
    },
    Table: {
      borderRadius: 12,
      headerBg:     '#f5f5f7',
      rowHoverBg:   '#f5f5f7',
      fontSize:     14,
    },
    Steps: {
      colorPrimary: '#0071e3',
    },
    Badge: {
      colorError: '#ff3b30',
    },
    Tag: {
      borderRadiusSM: 980,
    },
    Switch: {
      colorPrimary: '#34c759',
    },
    Radio: {
      colorPrimary: '#0071e3',
      buttonSolidCheckedBg: '#0071e3',
    },
    Notification: {
      borderRadiusLG: 18,
    },
    Message: {
      borderRadiusLG: 980,
    },
  },
};

/** @deprecated Use appleTheme */
export const darkNeonTheme = appleTheme;
