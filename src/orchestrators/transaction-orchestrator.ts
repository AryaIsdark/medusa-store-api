export type TransactionStepDefinition = {
  title: string;
  id: string;
  action: () => {};
  rollback: (payload?: any) => {};
};

export class TransactionOrchestrator {
  private transactionName: string;
  private transactionSteps: TransactionStepDefinition[];

  constructor(
    transactionName: string,
    transactionSteps: TransactionStepDefinition[]
  ) {
    this.transactionName = transactionName;
    this.transactionSteps = transactionSteps;
  }

  async executeRollbackStep(step: TransactionStepDefinition, payload) {
    await step.rollback(payload);
  }

  async executeStep(step: TransactionStepDefinition) {
    await step.action();
  }

  async startTransaction() {
    console.log(`Starting transaction: ${this.transactionName}`);
    console.log("Executing transaction steps:");
    await Promise.all(
      this.transactionSteps.map(async (step) => {
        console.log(`Step: ${step.title}`);
        try {
          await this.executeStep(step);
        } catch (error) {
          console.log("eeeeeeeeeeeeeeeeeeeeeeeeeee", error);
          throw error;
        }
      })
    );
    console.log("Transaction completed.");
  }

  async rollbackTransaction(payload) {
    console.log(`Rolling back transaction: ${this.transactionName}`);
    console.log("Executing rollback steps:");
    // We assume that the rollback steps are executed in reverse order

    await Promise.all(
      this.transactionSteps.map(async (step) => {
        await this.executeRollbackStep(step, payload);
      })
    );

    console.log("Rollback completed.");
  }
}
