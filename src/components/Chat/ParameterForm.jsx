import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { getSkillById } from '../../services/api';
import './ParameterForm.css';

export default function ParameterForm() {
  const { activeSession } = useAppState();
  const dispatch = useAppDispatch();
  const [parameters, setParameters] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSkillParams();
  }, [activeSession.skillId]);

  async function loadSkillParams() {
    if (!activeSession.skillId) return;
    setLoading(true);
    try {
      const response = await getSkillById(activeSession.skillId);
      if (response.success) {
        setParameters(response.data.parameters);
        // Initialize form values with defaults
        const defaults = {};
        response.data.parameters.forEach((param) => {
          if (param.defaultValue !== null && param.defaultValue !== undefined) {
            defaults[param.name] = param.defaultValue;
          } else if (param.type === 'boolean') {
            defaults[param.name] = false;
          } else {
            defaults[param.name] = '';
          }
        });
        setFormValues(defaults);
      }
    } catch (err) {
      console.error('Failed to load skill parameters:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(name, value) {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear error on edit
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function validate() {
    const newErrors = {};
    parameters.forEach((param) => {
      if (param.required && !formValues[param.name] && formValues[param.name] !== false) {
        newErrors[param.name] = `${param.label} is required`;
      }
      if (param.type === 'email' && formValues[param.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues[param.name])) {
          newErrors[param.name] = 'Enter a valid email address';
        }
      }
      if (param.type === 'url' && formValues[param.name]) {
        try {
          new URL(formValues[param.name]);
        } catch {
          newErrors[param.name] = 'Enter a valid URL (include https://)';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    // Process values — convert comma_separated to arrays
    const processedValues = {};
    const parameterLabels = {};
    parameters.forEach((param) => {
      parameterLabels[param.name] = param.label;
      if (param.type === 'comma_separated' && formValues[param.name]) {
        processedValues[param.name] = formValues[param.name]
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        processedValues[param.name] = formValues[param.name];
      }
    });

    dispatch({
      type: 'SUBMIT_PARAMETERS',
      payload: { parameters: processedValues, parameterLabels },
    });
  }

  function renderField(param, index) {
    const hasError = !!errors[param.name];
    const commonProps = {
      id: `field-${param.name}`,
      value: formValues[param.name] ?? '',
      onChange: (e) => handleChange(param.name, e.target.value),
      placeholder: param.placeholder || '',
      className: `form-input ${hasError ? 'form-input--error' : ''}`,
    };

    switch (param.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={3} />;

      case 'select':
        return (
          <select
            {...commonProps}
            onChange={(e) => handleChange(param.name, e.target.value)}
          >
            <option value="">Choose...</option>
            {param.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="form-toggle">
            <input
              type="checkbox"
              id={`field-${param.name}`}
              checked={!!formValues[param.name]}
              onChange={(e) => handleChange(param.name, e.target.checked)}
            />
            <span className="form-toggle-track">
              <span className="form-toggle-thumb" />
            </span>
            <span className="form-toggle-label">
              {formValues[param.name] ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        );

      case 'date':
        return <input type="date" {...commonProps} />;

      case 'number':
        return <input type="number" {...commonProps} />;

      case 'email':
        return <input type="email" {...commonProps} />;

      case 'password':
        return <input type="password" {...commonProps} />;

      case 'url':
      case 'text':
      case 'comma_separated':
      default:
        return <input type="text" {...commonProps} />;
    }
  }

  if (loading) {
    return (
      <div className="param-form-loading">
        <div className="param-form-loading-shimmer" />
        <div className="param-form-loading-shimmer param-form-loading-shimmer--short" />
        <div className="param-form-loading-shimmer" />
      </div>
    );
  }

  return (
    <form className="param-form" onSubmit={handleSubmit} id="param-form">
      <div className="param-form-fields">
        {parameters.map((param, index) => (
          <div
            key={param.name}
            className="param-field"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <label className="param-label" htmlFor={`field-${param.name}`}>
              {param.label}
              {param.required && <span className="param-required" aria-label="required">*</span>}
            </label>
            {param.helpText && (
              <p className="param-help">{param.helpText}</p>
            )}
            {renderField(param, index)}
            {errors[param.name] && (
              <p className="param-error" role="alert">{errors[param.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="param-form-footer">
        <button type="submit" className="param-submit-btn" id="btn-run-skill">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <polygon points="4,3 13,8 4,13" fill="currentColor" />
          </svg>
          Run Skill
        </button>
      </div>
    </form>
  );
}
