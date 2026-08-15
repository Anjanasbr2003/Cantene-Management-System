import { theme } from 'antd';

/* Refined Dark Theme (Default) - Apple Titanium & Deep Obsidian */
export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary:         '#2997ff',
    colorInfo:            '#2997ff',
    colorSuccess:         '#30d158',
    colorWarning:         '#ffd60a',
    colorError:           '#ff453a',
    colorBgBase:          '#0b0d14',
    colorBgContainer:     '#151922',
    colorBgElevated:      '#1c2130',
    colorBgLayout:        '#080a0f',
    colorBorder:          '#282e3f',
    colorBorderSecondary: '#1f2433',
    colorTextBase:        '#f5f5f7',
    colorTextSecondary:   '#a1a1a6',
    colorTextPlaceholder: '#6e6e73',
    borderRadius:         8,
    borderRadiusLG:       18,
    borderRadiusSM:       5,
    fontFamily:           "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif",
    fontSize:             17,
    fontSizeSM:           14,
    lineHeight:           1.47,
    controlHeight:        44,
    controlHeightLG:      48,
    motionDurationMid:    '0.18s',
    motionEaseInOut:      'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  components: {
    Button: {
      colorPrimary:        '#2997ff',
      colorPrimaryHover:   '#52abff',
      colorPrimaryActive:  '#0071e3',
      borderRadius:        9999,
      borderRadiusLG:      9999,
      fontWeight:          500,
      controlHeight:       40,
      controlHeightLG:     44,
      paddingInline:       22,
      paddingInlineLG:     28,
      primaryShadow:       '0 4px 14px rgba(41, 151, 255, 0.35)',
    },
    Card: {
      colorBgContainer: '#151922',
      borderRadiusLG:   18,
      paddingLG:        24,
    },
    Modal: {
      colorBgElevated: '#1a1f2c',
      borderRadiusLG: 18,
    },
    Drawer: {
      colorBgElevated: '#141824',
    },
    Tabs: {
      itemColor:         '#8e8e93',
      itemSelectedColor: '#2997ff',
      itemHoverColor:    '#f5f5f7',
      inkBarColor:       '#2997ff',
      titleFontSize:     14,
    },
    Input: {
      borderRadius: 9999,
      controlHeight: 44,
      colorBgContainer: '#12151f',
      activeBorderColor: '#2997ff',
      hoverBorderColor: '#3e475d',
      paddingInline: 18,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
      colorBgContainer: '#12151f',
      colorBgElevated: '#1c2130',
    },
    Table: {
      borderRadius: 12,
      headerBg:     '#10131d',
      rowHoverBg:   '#181c28',
      fontSize:     14,
    },
    Steps: {
      colorPrimary: '#2997ff',
    },
    Badge: {
      colorError: '#ff453a',
    },
    Tag: {
      borderRadiusSM: 9999,
    },
    Switch: {
      colorPrimary: '#30d158',
    },
    Radio: {
      colorPrimary: '#2997ff',
      buttonSolidCheckedBg: '#2997ff',
    },
    Notification: {
      colorBgElevated: '#1a1f2c',
      borderRadiusLG: 18,
    },
    Message: {
      borderRadiusLG: 9999,
    },
  },
};

/* Refined Light Theme */
export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary:         '#0066cc',
    colorInfo:            '#0066cc',
    colorSuccess:         '#34c759',
    colorWarning:         '#ff9500',
    colorError:           '#ff3b30',
    colorBgBase:          '#ffffff',
    colorBgContainer:     '#ffffff',
    colorBgElevated:      '#ffffff',
    colorBgLayout:        '#f5f5f7',
    colorBorder:          '#e0e0e0',
    colorBorderSecondary: '#f0f0f0',
    colorTextBase:        '#1d1d1f',
    colorTextSecondary:   '#7a7a7a',
    colorTextPlaceholder: '#7a7a7a',
    borderRadius:         8,
    borderRadiusLG:       18,
    borderRadiusSM:       5,
    fontFamily:           "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif",
    fontSize:             17,
    fontSizeSM:           14,
    lineHeight:           1.47,
    controlHeight:        44,
    controlHeightLG:      48,
    motionDurationMid:    '0.18s',
    motionEaseInOut:      'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  components: {
    Button: {
      colorPrimary:        '#0066cc',
      colorPrimaryHover:   '#0071e3',
      colorPrimaryActive:  '#0055b3',
      borderRadius:        9999,
      borderRadiusLG:      9999,
      fontWeight:          400,
      controlHeight:       40,
      controlHeightLG:     44,
      paddingInline:       22,
      paddingInlineLG:     28,
      primaryShadow:       'none',
    },
    Card: {
      colorBgContainer: '#ffffff',
      borderRadiusLG:   18,
      paddingLG:        24,
    },
    Modal: {
      borderRadiusLG: 18,
    },
    Drawer: {
      colorBgElevated: '#ffffff',
    },
    Tabs: {
      itemColor:         '#7a7a7a',
      itemSelectedColor: '#0066cc',
      itemHoverColor:    '#1d1d1f',
      inkBarColor:       '#0066cc',
      titleFontSize:     14,
    },
    Input: {
      borderRadius: 9999,
      controlHeight: 44,
      activeBorderColor: '#0071e3',
      hoverBorderColor: '#7a7a7a',
      paddingInline: 18,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Table: {
      borderRadius: 12,
      headerBg:     '#f5f5f7',
      rowHoverBg:   '#fafafc',
      fontSize:     14,
    },
    Steps: {
      colorPrimary: '#0066cc',
    },
    Badge: {
      colorError: '#ff3b30',
    },
    Tag: {
      borderRadiusSM: 9999,
    },
    Switch: {
      colorPrimary: '#34c759',
    },
    Radio: {
      colorPrimary: '#0066cc',
      buttonSolidCheckedBg: '#0066cc',
    },
    Notification: {
      borderRadiusLG: 18,
    },
    Message: {
      borderRadiusLG: 9999,
    },
  },
};

export const appleTheme = darkTheme;
export const darkNeonTheme = darkTheme;
