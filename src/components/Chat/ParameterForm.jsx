import { useState, useEffect, useRef } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { getSkillById } from '../../services/api';
import './ParameterForm.css';

// Simple robust CSV parser with quote support
function parseCSV(text, parameters) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Parse headers if present
  let headers = [];
  let startIdx = 0;
  
  const firstLineCells = lines[0].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
  const paramNamesAndLabels = parameters
    .map(p => p.name.toLowerCase())
    .concat(parameters.map(p => p.label.toLowerCase()));
  
  const isHeader = firstLineCells.some(cell => paramNamesAndLabels.includes(cell.toLowerCase()));
  if (isHeader) {
    headers = firstLineCells;
    startIdx = 1;
  } else {
    headers = parameters.map(p => p.name);
  }

  const rows = [];
  for (let i = startIdx; i < lines.length; i++) {
    const cells = [];
    let current = '';
    let inQuotes = false;
    const lineText = lines[i];
    
    for (let charIdx = 0; charIdx < lineText.length; charIdx++) {
      const char = lineText[charIdx];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim().replace(/^["']|["']$/g, ''));

    const rowObj = {};
    parameters.forEach((param, colIdx) => {
      let val = '';
      if (isHeader) {
        const headerIdx = headers.findIndex(
          h => h.toLowerCase() === param.name.toLowerCase() || h.toLowerCase() === param.label.toLowerCase()
        );
        val = headerIdx !== -1 ? cells[headerIdx] : cells[colIdx];
      } else {
        val = cells[colIdx];
      }
      
      if (param.type === 'boolean') {
        rowObj[param.name] = val ? ['true', '1', 'yes', 'enabled', 'active'].includes(val.toLowerCase()) : false;
      } else if (param.type === 'number') {
        rowObj[param.name] = val ? Number(val) : '';
      } else if (param.type === 'comma_separated') {
        rowObj[param.name] = val ? val.split(';').map(s => s.trim()).filter(Boolean) : [];
      } else {
        rowObj[param.name] = val ?? '';
      }
    });
    rows.push(rowObj);
  }
  return rows;
}

export default function ParameterForm() {
  const { activeSession } = useAppState();
  const dispatch = useAppDispatch();
  
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'csv'
  const [parameters, setParameters] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  // CSV Upload States
  const [csvFile, setCsvFile] = useState(null);
  const [csvRows, setCsvRows] = useState([]);
  const [csvError, setCsvError] = useState(null);
  const fileInputRef = useRef(null);

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
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  function handleCsvFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);
    setCsvError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = parseCSV(text, parameters);
        if (rows.length === 0) {
          throw new Error('CSV is empty or contains no valid rows.');
        }

        const missingRequired = [];
        rows.forEach((row, idx) => {
          parameters.forEach((param) => {
            if (param.required && (!row[param.name] && row[param.name] !== false)) {
              missingRequired.push(`Row ${idx + 1}: ${param.label} is required`);
            }
          });
        });

        if (missingRequired.length > 0) {
          setCsvError(missingRequired.slice(0, 3).join(', ') + (missingRequired.length > 3 ? ` (+${missingRequired.length - 3} more errors)` : ''));
          setCsvRows([]);
        } else {
          setCsvRows(rows);
        }
      } catch (err) {
        setCsvError(err.message || 'Failed to parse CSV file.');
        setCsvRows([]);
      }
    };
    reader.readAsText(file);
  }

  function clearCsv() {
    setCsvFile(null);
    setCsvRows([]);
    setCsvError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    
    if (activeTab === 'csv') {
      if (csvRows.length === 0) return;

      const processedValues = {
        isBulk: true,
        csvRows: csvRows,
        rowCount: csvRows.length,
        ...csvRows[0] // fallback for simple labels
      };

      const parameterLabels = {
        isBulk: 'Run Mode',
        rowCount: 'Total Rows',
      };
      parameters.forEach((param) => {
        parameterLabels[param.name] = param.label;
      });

      dispatch({
        type: 'SUBMIT_PARAMETERS',
        payload: { parameters: processedValues, parameterLabels },
      });
      return;
    }

    if (!validate()) return;

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
      <div className="param-form-tabs">
        <button
          type="button"
          className={`param-form-tab ${activeTab === 'manual' ? 'param-form-tab--active' : ''}`}
          onClick={() => setActiveTab('manual')}
        >
          Form Input
        </button>
        <button
          type="button"
          className={`param-form-tab ${activeTab === 'csv' ? 'param-form-tab--active' : ''}`}
          onClick={() => setActiveTab('csv')}
        >
          CSV Upload
        </button>
      </div>

      <div className="param-form-fields">
        {activeTab === 'manual' ? (
          parameters.map((param, index) => (
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
          ))
        ) : (
          <div className="csv-upload-container">
            {csvRows.length > 0 ? (
              <div className="csv-loaded-view">
                <div className="csv-loaded-header">
                  <div className="csv-file-summary">
                    <svg className="csv-file-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <div className="csv-file-metadata">
                      <span className="csv-file-name">{csvFile?.name}</span>
                      <span className="csv-file-size-count">
                        {(csvFile?.size / 1024).toFixed(1)} KB · {csvRows.length} rows loaded
                      </span>
                    </div>
                  </div>
                  <button type="button" className="csv-remove-btn" onClick={clearCsv}>
                    Remove CSV
                  </button>
                </div>

                <div className="csv-preview">
                  <div className="csv-preview-title">CSV Data Table</div>
                  <div className="csv-preview-table-wrapper">
                    <table className="csv-preview-table">
                      <thead>
                        <tr>
                          {parameters.map((p) => (
                            <th key={p.name}>{p.label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvRows.map((row, idx) => (
                          <tr key={idx}>
                            {parameters.map((p) => (
                              <td key={p.name}>
                                {Array.isArray(row[p.name])
                                  ? row[p.name].join(', ')
                                  : String(row[p.name] ?? '—')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="csv-initial-view">
                <p className="csv-upload-instruction">
                  Upload a CSV file to automate multiple executions. Each row in the CSV file represents a single automated run.
                </p>
                
                <div className="csv-expected-cols">
                  <span className="csv-expected-title">Expected Columns (Headers):</span>
                  <div className="csv-cols-list">
                    {parameters.map((p) => (
                      <span key={p.name} className={`csv-col-tag ${p.required ? 'csv-col-tag--required' : ''}`}>
                        {p.name}{p.required && '*'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="csv-dropzone">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    ref={fileInputRef}
                    id="csv-file-input"
                    className="csv-file-hidden"
                  />
                  <label htmlFor="csv-file-input" className="csv-upload-label">
                    <svg className="csv-upload-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Choose CSV file or drag here</span>
                  </label>
                </div>

                {csvError && (
                  <p className="param-error csv-parse-error" role="alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {csvError}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="param-form-footer">
        <button
          type="submit"
          className="param-submit-btn"
          id="btn-run-skill"
          disabled={activeTab === 'csv' && csvRows.length === 0}
          style={{
            opacity: activeTab === 'csv' && csvRows.length === 0 ? 0.6 : 1,
            cursor: activeTab === 'csv' && csvRows.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <polygon points="4,3 13,8 4,13" fill="currentColor" />
          </svg>
          {activeTab === 'csv' ? `Run Bulk Automation (${csvRows.length} runs)` : 'Run Skill'}
        </button>
      </div>
    </form>
  );
}
