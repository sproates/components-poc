import { FormEvent, useState } from "react";
import { Button } from "../../atoms/Button";
import { Checkbox } from "../../atoms/Checkbox";
import { TextInput } from "../../atoms/TextInput";
import { FormField } from "../FormField";
import { classNames } from "../../utils/classNames";

export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginFormLabels {
  email: string;
  password: string;
  remember: string;
  submit: string;
}

export interface LoginFormProps {
  className?: string;
  defaultEmail?: string;
  isSubmitting?: boolean;
  labels?: Partial<LoginFormLabels>;
  onSubmit: (credentials: LoginCredentials) => void;
}

const defaultLabels: LoginFormLabels = {
  email: "Email",
  password: "Password",
  remember: "Remember this device",
  submit: "Sign in"
};

export function LoginForm({
  className,
  defaultEmail = "",
  isSubmitting = false,
  labels,
  onSubmit
}: LoginFormProps) {
  const copy = { ...defaultLabels, ...labels };
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ email, password, remember });
  }

  return (
    <form className={classNames("ds-login-form", className)} onSubmit={handleSubmit}>
      <div className="ds-login-form__fields">
        <FormField label={copy.email}>
          <TextInput
            autoComplete="email"
            inputMode="email"
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
            type="email"
            value={email}
          />
        </FormField>
        <FormField label={copy.password}>
          <TextInput
            autoComplete="current-password"
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
            type="password"
            value={password}
          />
        </FormField>
      </div>
      <div className="ds-login-form__actions">
        <Checkbox
          checked={remember}
          className="ds-login-form__remember"
          label={copy.remember}
          onChange={(event) => setRemember(event.currentTarget.checked)}
        />
        <Button isLoading={isSubmitting} type="submit">
          {copy.submit}
        </Button>
      </div>
    </form>
  );
}
