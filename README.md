# @lp-labs/react-number-input

Locale-aware numeric input with explicit decimal precision, bounds and stepping. React 18+ peer only; native Intl formatting. ESM, CommonJS and TypeScript included.

## Installation

```sh
npm install @lp-labs/react-number-input
```

## Quick Start

```jsx
import { NumberInput } from '@lp-labs/react-number-input';
export default function Example() {
  return (
    <NumberInput
      label="Quantity"
      defaultValue={1}
      min={0}
      max={100}
      step={0.25}
      precision={2}
      locale="en-US"
    />
  );
}
```

## API

Props: value/defaultValue=null, onChange(number|null), min=-1e9, max=1e9, step=1, precision=2, locale='en-US', label='Number', disabled, required, name, className, onInvalid(message). Text is committed on blur/Enter; invalid values leave the committed state unchanged. Escape restores display; Up/Down steps, Home/End reach bounds. Step controls clamp and round. name renders the canonical numeric value in a hidden form input. parseLocaleNumber(text,locale) and roundNumber(value,precision) are exported. Locale grouping separators are stripped; this is not a strict locale grouping-pattern validator.

## Benefits

| Area                     | Details                                       |
| ------------------------ | --------------------------------------------- |
| Native locale formatting | Use Intl for display and locale digits.       |
| Explicit numeric bounds  | Clamp values and expose spinbutton semantics. |
| Precision caps           | Avoid unbounded decimal scaling.              |

## Customization

| Area   | Details                                                       |
| ------ | ------------------------------------------------------------- |
| Range  | Set min, max, step, and precision.                            |
| Locale | Choose locale and accessible label.                           |
| State  | Use controlled value, callbacks, and required/disabled modes. |

## Security And Limits

Input length: 128 characters; precision: 0–12, finite bounds/step, safe-integer-scaled rounding. Scientific notation and arbitrary expressions are rejected. Uses JavaScript numbers, not arbitrary-precision decimal arithmetic; do not use for accounting/cryptographic quantities needing exact decimals. Validate currency/quantity rules on the server. Controlled values must be finite and in bounds; precision is applied on user commits. Custom locale support depends on Intl. Empty values are null unless required.

## Support

[Donate via PayPal](https://www.paypal.me/LibinPrasanth). Author: [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/).

## License

MIT License. See the packaged [LICENSE](LICENSE) file.
