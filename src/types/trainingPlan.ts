export interface TrainingDay {
  id: string;
  day: string;
  muscle: string;
  exercises: string;
  equipment: string;
  suggestions: string;
}

export interface WeeklyPlan {
  days: TrainingDay[];
  updatedAt: string;
  updatedBy: string;
}