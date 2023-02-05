export function validate(validatable) {
    let isValid = true;
    if (validatable.required) {
        isValid = isValid && validatable.value.toString().trim().length !== 0;
    }
    if (validatable.minLength != null && typeof validatable.value === 'string') {
        isValid = isValid && validatable.value.length > validatable.minLength;
    }
    if (validatable.maxLenght != null && typeof validatable.value === 'string') {
        isValid = isValid && validatable.value.length < validatable.maxLenght;
    }
    if (validatable.min != null && typeof validatable.value === 'number') {
        isValid = isValid && validatable.value >= validatable.min;
    }
    if (validatable.max != null && typeof validatable.value === 'number') {
        isValid = isValid && validatable.value <= validatable.max;
    }
    return isValid;
}
