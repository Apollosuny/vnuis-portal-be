import { IntentRouteConfig } from '../interfaces/chatbot-intent.interface'

// Frontend routes mapping (mirror of frontend constants/router.ts)
export const FRONTEND_ROUTES = {
  // Student routes
  STUDENT_DASHBOARD: '/student-dashboard',
  STUDENT_FORMS: '/student-dashboard/forms',
  STUDENT_ROOMS: '/student-dashboard/rooms',
  STUDENT_BOOKINGS: '/student-dashboard/bookings',
  STUDENT_EVENTS: '/student-dashboard/events',
  STUDENT_FEEDBACK: '/student-dashboard/feedback',
  STUDENT_SETTINGS: '/student-dashboard/settings',
  STUDENT_NOTIFICATIONS: '/student-dashboard/notifications',
} as const

// Route to Intent mapping configuration
export const ROUTE_INTENT_MAPPING = {
  // Dashboard & Overview
  [FRONTEND_ROUTES.STUDENT_DASHBOARD]: {
    intent: 'dashboard',
    routeName: 'Dashboard',
    description: 'Trang chủ dashboard sinh viên',
    keywords: ['dashboard', 'trang chủ', 'home', 'overview', 'tổng quan', 'chính'],
    priority: 10,
    responseTemplate: 'Tôi sẽ đưa bạn đến trang chủ dashboard để xem tổng quan các hoạt động của bạn.',
    quickActions: [{ label: 'Đi đến Dashboard', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_DASHBOARD }],
  },

  // Room Booking
  [FRONTEND_ROUTES.STUDENT_ROOMS]: {
    intent: 'book_room',
    routeName: 'Đặt phòng',
    description: 'Đặt phòng học, phòng họp, phòng lab',
    keywords: ['đặt phòng', 'book room', 'phòng học', 'phòng họp', 'phòng lab', 'booking', 'đặt lịch phòng'],
    priority: 9,
    responseTemplate:
      'Tôi hiểu bạn muốn đặt phòng. Bạn có thể truy cập trang đặt phòng để xem các phòng có sẵn và đặt lịch.',
    quickActions: [
      { label: 'Đặt phòng ngay', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_ROOMS },
      { label: 'Xem lịch đặt', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_BOOKINGS },
    ],
  },

  [FRONTEND_ROUTES.STUDENT_BOOKINGS]: {
    intent: 'view_bookings',
    routeName: 'Lịch đặt phòng',
    description: 'Xem lịch đặt phòng của tôi',
    keywords: ['lịch đặt', 'my bookings', 'đặt phòng của tôi', 'booking history', 'xem booking', 'lịch phòng'],
    priority: 8,
    responseTemplate:
      'Bạn có thể xem tất cả lịch đặt phòng của mình tại đây. Tôi sẽ đưa bạn đến trang quản lý booking.',
    quickActions: [
      { label: 'Xem lịch đặt', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_BOOKINGS },
      { label: 'Đặt phòng mới', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_ROOMS },
    ],
  },

  // Events
  [FRONTEND_ROUTES.STUDENT_EVENTS]: {
    intent: 'view_events',
    routeName: 'Sự kiện',
    description: 'Xem sự kiện, hoạt động',
    keywords: ['sự kiện', 'events', 'hoạt động', 'event list', 'xem events', 'danh sách sự kiện'],
    priority: 8,
    responseTemplate: 'Có nhiều sự kiện thú vị đang diễn ra! Hãy xem danh sách sự kiện và đăng ký tham gia.',
    quickActions: [
      { label: 'Xem sự kiện', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_EVENTS },
      { label: 'Sự kiện sắp tới', action: 'navigate', route: `${FRONTEND_ROUTES.STUDENT_EVENTS}?filter=upcoming` },
    ],
  },

  // Forms
  [FRONTEND_ROUTES.STUDENT_FORMS]: {
    intent: 'submit_form',
    routeName: 'Nộp đơn',
    description: 'Nộp đơn hành chính',
    keywords: ['nộp đơn', 'submit form', 'đơn hành chính', 'administrative form', 'form submission'],
    priority: 8,
    responseTemplate: 'Bạn có thể nộp đơn hành chính tại đây. Tôi sẽ đưa bạn đến trang quản lý đơn.',
    quickActions: [
      { label: 'Nộp đơn', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_FORMS },
      { label: 'Xem đơn đã nộp', action: 'navigate', route: `${FRONTEND_ROUTES.STUDENT_FORMS}?filter=submitted` },
    ],
  },

  // Feedback
  [FRONTEND_ROUTES.STUDENT_FEEDBACK]: {
    intent: 'submit_feedback',
    routeName: 'Gửi phản hồi',
    description: 'Gửi phản hồi, góp ý',
    keywords: ['gửi phản hồi', 'submit feedback', 'góp ý', 'feedback', 'đánh giá', 'review'],
    priority: 6,
    responseTemplate: 'Bạn có thể gửi phản hồi và góp ý tại đây. Chúng tôi rất mong nhận được ý kiến của bạn.',
    quickActions: [{ label: 'Gửi phản hồi', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_FEEDBACK }],
  },

  // Notifications
  [FRONTEND_ROUTES.STUDENT_NOTIFICATIONS]: {
    intent: 'view_notifications',
    routeName: 'Thông báo',
    description: 'Xem thông báo',
    keywords: ['thông báo', 'notifications', 'tin nhắn', 'messages', 'xem thông báo'],
    priority: 6,
    responseTemplate: 'Bạn có thể xem tất cả thông báo mới tại đây.',
    quickActions: [{ label: 'Xem thông báo', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_NOTIFICATIONS }],
  },

  // Settings
  [FRONTEND_ROUTES.STUDENT_SETTINGS]: {
    intent: 'settings',
    routeName: 'Cài đặt',
    description: 'Cài đặt tài khoản',
    keywords: ['cài đặt', 'settings', 'tài khoản', 'account', 'profile', 'thông tin cá nhân'],
    priority: 5,
    responseTemplate: 'Bạn có thể cập nhật thông tin cá nhân và cài đặt tài khoản tại đây.',
    quickActions: [{ label: 'Cài đặt', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_SETTINGS }],
  },
} as const

// Additional intents that don't map directly to routes
export const ADDITIONAL_INTENTS = {
  cancel_booking: {
    intent: 'cancel_booking',
    routePath: FRONTEND_ROUTES.STUDENT_BOOKINGS,
    routeName: 'Hủy đặt phòng',
    description: 'Hủy lịch đặt phòng',
    keywords: ['hủy đặt', 'cancel booking', 'hủy phòng', 'hủy lịch', 'cancel room'],
    priority: 7,
    responseTemplate: 'Để hủy đặt phòng, bạn cần vào trang lịch đặt phòng và chọn booking muốn hủy.',
    quickActions: [{ label: 'Xem lịch đặt', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_BOOKINGS }],
  },

  register_event: {
    intent: 'register_event',
    routePath: FRONTEND_ROUTES.STUDENT_EVENTS,
    routeName: 'Đăng ký sự kiện',
    description: 'Đăng ký tham gia sự kiện',
    keywords: ['đăng ký sự kiện', 'register event', 'tham gia', 'join event', 'đăng ký tham gia'],
    priority: 7,
    responseTemplate: 'Để đăng ký tham gia sự kiện, bạn cần vào trang sự kiện và chọn sự kiện muốn tham gia.',
    quickActions: [{ label: 'Xem sự kiện', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_EVENTS }],
  },

  view_forms: {
    intent: 'view_forms',
    routePath: FRONTEND_ROUTES.STUDENT_FORMS,
    routeName: 'Đơn đã nộp',
    description: 'Xem đơn đã nộp',
    keywords: ['đơn đã nộp', 'my forms', 'form history', 'trạng thái đơn', 'xem đơn', 'form status'],
    priority: 7,
    responseTemplate: 'Bạn có thể xem tất cả đơn đã nộp và trạng thái xử lý tại đây.',
    quickActions: [
      { label: 'Xem đơn đã nộp', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_FORMS },
      { label: 'Nộp đơn mới', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_FORMS },
    ],
  },

  help: {
    intent: 'help',
    routePath: FRONTEND_ROUTES.STUDENT_DASHBOARD,
    routeName: 'Trợ giúp',
    description: 'Trợ giúp chung',
    keywords: ['help', 'trợ giúp', 'hướng dẫn', 'support', 'giúp đỡ', 'làm sao'],
    priority: 4,
    responseTemplate:
      'Tôi có thể giúp bạn với các vấn đề về đặt phòng, sự kiện, đơn hành chính và nhiều thứ khác. Bạn cần gì?',
    quickActions: [
      { label: 'Đặt phòng', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_ROOMS },
      { label: 'Xem sự kiện', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_EVENTS },
      { label: 'Nộp đơn', action: 'navigate', route: FRONTEND_ROUTES.STUDENT_FORMS },
    ],
  },
} as const

/**
 * Generate intent routes configuration from frontend routes
 * This ensures backend always stays in sync with frontend routes
 */
export function generateIntentRoutesConfig(): IntentRouteConfig[] {
  const routes: IntentRouteConfig[] = []

  // Add routes from ROUTE_INTENT_MAPPING
  for (const [routePath, config] of Object.entries(ROUTE_INTENT_MAPPING)) {
    routes.push({
      intent: config.intent,
      routePath,
      routeName: config.routeName,
      description: config.description,
      keywords: [...config.keywords],
      priority: config.priority,
      responseTemplate: config.responseTemplate,
      quickActions: [...config.quickActions],
    })
  }

  // Add additional intents
  for (const config of Object.values(ADDITIONAL_INTENTS)) {
    routes.push({
      ...config,
      keywords: [...config.keywords],
      quickActions: [...config.quickActions],
    })
  }

  return routes.sort((a, b) => b.priority - a.priority)
}

/**
 * Get route by intent
 */
export function getRouteByIntent(intent: string): IntentRouteConfig | undefined {
  const allRoutes = generateIntentRoutesConfig()
  return allRoutes.find((route) => route.intent === intent)
}

/**
 * Get intents by keywords
 */
export function getIntentsByKeywords(keywords: string[]): IntentRouteConfig[] {
  const allRoutes = generateIntentRoutesConfig()
  return allRoutes.filter((route) =>
    keywords.some((keyword) => route.keywords.some((k) => k.toLowerCase().includes(keyword.toLowerCase()))),
  )
}

/**
 * Get routes by category
 */
export function getRoutesByCategory(): Record<string, IntentRouteConfig[]> {
  const routes = generateIntentRoutesConfig()

  const categories = {
    booking: ['book_room', 'view_bookings', 'cancel_booking'],
    events: ['view_events', 'register_event'],
    forms: ['submit_form', 'view_forms'],
    feedback: ['submit_feedback'],
    notifications: ['view_notifications'],
    settings: ['settings'],
    general: ['dashboard', 'help'],
  }

  const result: Record<string, IntentRouteConfig[]> = {}

  for (const [category, intents] of Object.entries(categories)) {
    result[category] = routes.filter((route) => intents.includes(route.intent))
  }

  return result
}
