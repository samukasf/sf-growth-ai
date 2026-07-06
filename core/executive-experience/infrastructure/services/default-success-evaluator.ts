import {
  SuccessCase,
  type ExecutiveExperience,
  type SuccessEvaluation,
  type SuccessEvaluator,
} from "../../domain";

export class DefaultSuccessEvaluator implements SuccessEvaluator {
  evaluate(experience: ExecutiveExperience): SuccessEvaluation {
    const isSuccess = experience.isSuccessful();

    return {
      experienceId: experience.id,
      isSuccess,
      successLevel: experience.successLevel,
      reusableSolution: isSuccess ? experience.execution : "",
      bestPractice: isSuccess ? experience.decision : "",
    };
  }

  toSuccessCase(experience: ExecutiveExperience): SuccessCase {
    const evaluation = this.evaluate(experience);

    return SuccessCase.create({
      companyId: experience.companyId,
      experienceId: experience.id,
      title: experience.title,
      description: experience.result,
      successLevel: evaluation.successLevel,
      roi: experience.roi,
      reusableSolution: evaluation.reusableSolution || experience.execution,
    });
  }
}
