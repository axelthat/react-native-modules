export interface Result<S, E> {
  ok: (s: S) => Result<S, E>
  error: (e: E) => Result<S, E>
  isOk: () => boolean
  isErr: () => boolean
  unwrap: () => S | null
  unwrapErr: () => E | null
}

export const createResult = <S, E>(): Result<S, E> => {
  let _ok: S | null = null
  let _error: E | null = null

  return {
    ok(s: S) {
      _ok = s
      return this
    },
    error(e: E) {
      _error = e
      return this
    },
    isOk: () => {
      return !!_ok
    },
    isErr: () => {
      return !!_error
    },
    unwrap: () => {
      return _ok
    },
    unwrapErr: () => {
      return _error
    }
  }
}
