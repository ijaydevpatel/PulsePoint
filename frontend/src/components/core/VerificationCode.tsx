import React, { useRef, useState } from "react";

export function VerificationCode({ length = 6 }: { length?: number }) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!/^[0-9A-Z]*$/i.test(val)) return; // Allow numbers and letters
    
    const newDigits = [...digits];
    // Take the last character in case they type fast
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);

    // Move to next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^[0-9A-Z]*$/i.test(pastedData)) return;

    const newDigits = [...digits];
    pastedData.split("").forEach((char, idx) => {
      newDigits[idx] = char;
    });
    setDigits(newDigits);
    
    // Focus last filled input
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center w-full my-4">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { if (el) inputRefs.current[index] = el; }}
          type="text"
          inputMode="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-11 h-14 bg-surface-low border border-border-glass rounded-xl text-center text-xl font-bold text-text-primary focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
          autoComplete="one-time-code"
        />
      ))}
      {/* Hidden input seamlessly passes the constructed code to the form data handler */}
      <input type="hidden" name="code" value={digits.join("")} required />
    </div>
  );
}
