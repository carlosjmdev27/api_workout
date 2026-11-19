import type { JSX } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { NotFound } from './components/NotFound';
import { HistoryPage } from './features/history/pages/HistoryPage';
import { SessionSummaryPage } from './features/history/pages/SessionSummaryPage';
import { RoutineCreatePage } from './features/routines/pages/RoutineCreatePage';
import { RoutineDetailPage } from './features/routines/pages/RoutineDetailPage';
import { RoutineEditPage } from './features/routines/pages/RoutineEditPage';
import { RoutineListPage } from './features/routines/pages/RoutineListPage';
import { ActiveWorkoutBanner } from './features/workout/components/ActiveWorkoutBanner';
import { WorkoutPage } from './features/workout/pages/WorkoutPage';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout banner={<ActiveWorkoutBanner />} />}>
          <Route index element={<RoutineListPage />} />
          <Route path="routines/new" element={<RoutineCreatePage />} />
          <Route path="routines/:routineId" element={<RoutineDetailPage />} />
          <Route path="routines/:routineId/edit" element={<RoutineEditPage />} />
          <Route path="workout/active/:dayId" element={<WorkoutPage />} />
          <Route path="days/:dayId/history" element={<HistoryPage />} />
          <Route path="sessions/:sessionId" element={<SessionSummaryPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
