import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";

export type FormCheck = (form: HTMLFormElement) => boolean;

const alwaysComplete: FormCheck = () => true;

/** True when the form's native required fields pass and `isComplete` also passes. */
function formIsReady(form: HTMLFormElement | null, isComplete: FormCheck): boolean {
  return form !== null && form.checkValidity() && isComplete(form);
}

/** Whether the named field holds a non-blank value. Used for rules such as "email or phone". */
export function hasValue(form: HTMLFormElement, name: string): boolean {
  return String(new FormData(form).get(name) ?? "").trim() !== "";
}

interface FormReady {
  submitDisabled: boolean;
  formProps: {
    ref: RefObject<HTMLFormElement | null>;
    onChange: (event: FormEvent<HTMLFormElement>) => void;
  };
}

/**
 * Keeps submit disabled until the native required fields are filled and `isComplete` passes.
 * It also re-checks after every render, so changes made through React state count too.
 */
export function useFormReady(isComplete: FormCheck = alwaysComplete): FormReady {
  const formRef = useRef<HTMLFormElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(formIsReady(formRef.current, isComplete));
  });

  function handleChange(event: FormEvent<HTMLFormElement>) {
    setReady(formIsReady(event.currentTarget, isComplete));
  }

  return { submitDisabled: !ready, formProps: { ref: formRef, onChange: handleChange } };
}
