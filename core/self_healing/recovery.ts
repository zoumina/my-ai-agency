export interface RecoveryResult {
  recovered: boolean;
  attempts: number;
  rolledBack: boolean;
  message: string;
}

export async function recover(
  operation: () => Promise<void>,
  rollback: () => Promise<void>,
  maxAttempts = 3
): Promise<RecoveryResult> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    attempts++;
    try {
      await operation();
      return { recovered: true, attempts, rolledBack: false, message: "Operation recovered." };
    } catch {
      if (attempts === maxAttempts) {
        await rollback();
        return { recovered: false, attempts, rolledBack: true, message: "Recovery threshold reached; rollback executed." };
      }
    }
  }
  return { recovered: false, attempts, rolledBack: false, message: "Recovery failed." };
}