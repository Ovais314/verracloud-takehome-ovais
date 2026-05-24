import { useState } from 'react';
import { useAddHoldingMutation } from '../services/api/holdingsApi';
import { parseApiError, getFieldError } from '../utils/errors';
import {
  validateHoldingForm,
  isFormValid,
} from '../utils/validation';

const INITIAL_FORM = {
  ticker: '',
  quantity: '',
  purchasePrice: '',
};

export function AddHoldingForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [clientErrors, setClientErrors] = useState({});
  const [apiBanner, setApiBanner] = useState('');
  const [addHolding, { isLoading }] = useAddHoldingMutation();

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setClientErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setApiBanner('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateHoldingForm(form);
    setClientErrors(errors);
    setApiBanner('');

    if (!isFormValid(errors)) {
      return;
    }

    try {
      await addHolding({
        ticker: form.ticker.trim().toUpperCase(),
        quantity: Number(form.quantity),
        purchasePrice: Number(form.purchasePrice),
      }).unwrap();

      setForm(INITIAL_FORM);
      setClientErrors({});
    } catch (error) {
      const { message, fieldErrors } = parseApiError(error);
      setApiBanner(message);
      if (Object.keys(fieldErrors).length > 0) {
        setClientErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    }
  };

  const errors = clientErrors;
  const canSubmit =
    !isLoading &&
    form.ticker.trim() !== '' &&
    form.quantity !== '' &&
    form.purchasePrice !== '' &&
    isFormValid(validateHoldingForm(form));

  return (
    <form className="holding-form" onSubmit={handleSubmit} noValidate>
      {apiBanner && (
        <div className="holding-form__banner" role="alert">
          {apiBanner}
        </div>
      )}

      <div className="holding-form__field">
        <label className="holding-form__label" htmlFor="ticker">
          Ticker
        </label>
        <input
          id="ticker"
          name="ticker"
          type="text"
          autoComplete="off"
          placeholder="e.g. AAPL"
          value={form.ticker}
          onChange={handleChange('ticker')}
          className={errors.ticker ? 'input-error' : ''}
          aria-invalid={Boolean(errors.ticker)}
          aria-describedby={errors.ticker ? 'ticker-error' : undefined}
        />
        {errors.ticker && (
          <span id="ticker-error" className="holding-form__error">
            {getFieldError(errors, 'ticker') || errors.ticker}
          </span>
        )}
      </div>

      <div className="holding-form__field">
        <label className="holding-form__label" htmlFor="quantity">
          Quantity
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min="0"
          step="any"
          placeholder="0"
          value={form.quantity}
          onChange={handleChange('quantity')}
          className={errors.quantity ? 'input-error' : ''}
          aria-invalid={Boolean(errors.quantity)}
          aria-describedby={errors.quantity ? 'quantity-error' : undefined}
        />
        {errors.quantity && (
          <span id="quantity-error" className="holding-form__error">
            {getFieldError(errors, 'quantity') || errors.quantity}
          </span>
        )}
      </div>

      <div className="holding-form__field">
        <label className="holding-form__label" htmlFor="purchasePrice">
          Purchase Price
        </label>
        <input
          id="purchasePrice"
          name="purchasePrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={form.purchasePrice}
          onChange={handleChange('purchasePrice')}
          className={errors.purchasePrice ? 'input-error' : ''}
          aria-invalid={Boolean(errors.purchasePrice)}
          aria-describedby={
            errors.purchasePrice ? 'purchasePrice-error' : undefined
          }
        />
        {errors.purchasePrice && (
          <span id="purchasePrice-error" className="holding-form__error">
            {getFieldError(errors, 'purchasePrice') || errors.purchasePrice}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="holding-form__submit"
        disabled={!canSubmit}
      >
        {isLoading ? 'Adding…' : 'Add Holding'}
      </button>
    </form>
  );
}
