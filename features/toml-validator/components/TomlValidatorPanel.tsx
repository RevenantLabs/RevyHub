"use client";

import { Card } from "@/core/ui/Card";
import { StatusMessage } from "@/core/ui/StatusMessage";
import { useTomlValidator } from "@/features/toml-validator/hooks/useTomlValidator";
import { errorCopy } from "@/features/toml-validator/copy";
import { TomlValidatorForm } from "@/features/toml-validator/components/TomlValidatorForm";
import { TomlValidatorResult } from "@/features/toml-validator/components/TomlValidatorResult";
import { TomlValidatorEmptyState } from "@/features/toml-validator/components/TomlValidatorEmptyState";

export function TomlValidatorPanel() {
  const { state, submit } = useTomlValidator();

  return (
    <div className="space-y-5">
      <Card>
        <TomlValidatorForm onSubmit={submit} pending={state.status === "loading"} />
      </Card>

      {state.status === "error" ? (
        <StatusMessage
          type="error"
          title={errorCopy[state.code].title}
          description={errorCopy[state.code].description}
        />
      ) : null}

      {state.status === "success" ? <TomlValidatorResult result={state.result} /> : null}

      {state.status === "idle" ? <TomlValidatorEmptyState /> : null}
    </div>
  );
}
