export type AsyncState<T> =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly data: T }
  | { readonly status: "error"; readonly message: string };

export const IDLE_STATE = { status: "idle" } as const satisfies AsyncState<never>;
export const LOADING_STATE = { status: "loading" } as const satisfies AsyncState<never>;
