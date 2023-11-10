/**
 * Github Action에서 설정한 사용자 변수를 읽어옵니다.
 * */
export class UserVariable<T> {
    private constructor(private value: T | null) {}

    static of<T>(value: T): UserVariable<T> {
        return new UserVariable(value);
    }

    static nothing<T>(): UserVariable<T> {
        return new UserVariable<T>(null);
    }

    isJust(): boolean {
        return this.value !== null || this.value !== undefined;
    }

    isNothing(): boolean {
        return this.value === null;
    }

    map<U>(fn: (value: T) => U): UserVariable<U> {
        return this.isJust() ? UserVariable.of(fn(this.value as T)) : UserVariable.nothing<U>();
    }

    flatMap<U>(fn: (value: T) => UserVariable<U>): UserVariable<U> {
        return this.isJust() ? fn(this.value as T) : UserVariable.nothing<U>();
    }

    getOrElse(defaultValue: T): T {
        return this.isJust() ? this.value as T : defaultValue;
    }
}