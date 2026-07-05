import type { GoogleAnalyticsMetrics } from "@/features/google-analytics/services/google-analytics-executive.service";
import type { GoogleAnalyticsApiSnapshot } from "./google-analytics.types";

export function mapSnapshotToMetrics(
  snapshot: GoogleAnalyticsApiSnapshot,
): GoogleAnalyticsMetrics {
  const { traffic, users, sessions, conversions, channels, topPages, events } = snapshot;

  return {
    users: users.activeUsers,
    totalUsers: users.totalUsers,
    newUsers: users.newUsers,
    sessions: sessions.sessions,
    engagedSessions: sessions.engagedSessions,
    engagementRate: sessions.engagementRate,
    conversions: conversions.conversions,
    conversionRate: conversions.conversionRate,
    totalRevenue: conversions.totalRevenue,
    pageViews: traffic.pageViews,
    bounceRate: traffic.bounceRate,
    avgSessionDuration: traffic.avgSessionDuration,
    realtimeUsers: snapshot.realtime.activeUsers,
    trafficTrend: traffic.trend,
    trafficTrendPercent: traffic.trendPercent,
    topChannels: channels.channels.map((channel) => ({
      name: channel.name,
      sessions: channel.value,
      share: channel.share,
    })),
    topPages: topPages.pages.map((page) => ({
      path: page.name,
      views: page.value,
      share: page.share,
    })),
    topEvents: events.events.map((event) => ({
      name: event.name,
      count: event.value,
      share: event.share,
    })),
    topDevices: snapshot.devices.devices.map((device) => ({
      name: device.name,
      sessions: device.value,
      share: device.share,
    })),
    topCountries: snapshot.countries.countries.map((country) => ({
      name: country.name,
      users: country.value,
      share: country.share,
    })),
  };
}
