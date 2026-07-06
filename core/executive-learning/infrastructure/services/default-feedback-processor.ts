import type {
  FeedbackProcessor,
  FeedbackProcessingResult,
  LearningFeedback,
  LearningRecord,
} from "../../domain";

export class DefaultFeedbackProcessor implements FeedbackProcessor {
  process(record: LearningRecord, feedback: LearningFeedback): FeedbackProcessingResult {
    const updatedRecord = record.applyFeedback(feedback);
    const appliedLessons =
      feedback.sentiment === "negative"
        ? [`Avoid repeating: ${feedback.content}`]
        : [`Reinforce: ${feedback.content}`];

    return {
      feedback: feedback.toJSON(),
      updatedRecord: updatedRecord.toJSON(),
      appliedLessons,
    };
  }
}
