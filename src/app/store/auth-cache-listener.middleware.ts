import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { removeToken, setToken, setTokens } from "@/stores/auth.store";
import { groupApi } from "@/pages/groups/group.api";
import { groupFeedApi } from "@/pages/group-detail/groupFeed.api";
import { groupJournalsApi } from "@/pages/group-detail/groupJournals.api";
import { surveyApi } from "@/pages/surveys/survey.api";
import { calendarApi } from "@/services/calendar.api";
import { documentsApi } from "@/pages/documents/documents.api";
import { notificationApi } from "@/services/notification.api";
import { userApi } from "@/services/user.api";
import { chatApi } from "@/services/chat.api";
export const authCacheListener = createListenerMiddleware();
authCacheListener.startListening({
  matcher: isAnyOf(setTokens, setToken, removeToken),
  effect: (_action, api) => {
    api.dispatch(groupApi.util.resetApiState());
    api.dispatch(groupFeedApi.util.resetApiState());
    api.dispatch(groupJournalsApi.util.resetApiState());
    api.dispatch(surveyApi.util.resetApiState());
    api.dispatch(calendarApi.util.resetApiState());
    api.dispatch(documentsApi.util.resetApiState());
    api.dispatch(notificationApi.util.resetApiState());
    api.dispatch(userApi.util.resetApiState());
    api.dispatch(chatApi.util.resetApiState());
  }
});
