function ValidateEmail(email) {
    // Check for presence of "@" symbol
    if (!email.includes("@")) {
        return false;
    }
    // Split email into local part and domain
    const parts = email.split("@");
    if (parts.length !== 2) {
        return false;
    }
    const localPart = parts[0];
    const domain = parts[1];
    // Validate local part (basic check)
    if (localPart.length === 0 || localPart.includes(" ")) {
        return false;
    }
    // Validate domain (basic check)
    if (
        !domain.includes(".") ||
        domain.startsWith(".") ||
        domain.endsWith(".")
    ) {
        return false;
    }
    return true;
}
export { ValidateEmail };
