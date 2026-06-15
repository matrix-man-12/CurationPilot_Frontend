import { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import { getSkills } from '../../services/api';
import './SkillSelector.css';

export default function SkillSelector() {
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const searchRef = useRef(null);

  useEffect(() => {
    loadSkills();
  }, []);

  useEffect(() => {
    // Auto-focus search on mount
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadSkills(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  async function loadSkills(searchTerm = '') {
    setLoading(true);
    try {
      const response = await getSkills(searchTerm);
      if (response.success) {
        setCategories(response.data.categories);
        // Auto-expand all categories when searching
        if (searchTerm.trim()) {
          setExpandedCategories(new Set(response.data.categories.map((c) => c.id)));
        } else {
          setExpandedCategories(new Set());
        }
      }
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleCategory(categoryId) {
    setExpandedCategories((prev) => {
      const next = new Set();
      // Accordion style: only allow one category open at a time
      if (!prev.has(categoryId)) {
        next.add(categoryId);
      }
      return next;
    });
  }

  function handleSelectSkill(skill) {
    dispatch({
      type: 'SELECT_SKILL',
      payload: {
        skillId: skill.id,
        skillName: skill.name,
        skillDescription: skill.description,
      },
    });
  }

  const truncateDescription = (desc, limit = 70) => {
    if (!desc) return '';
    return desc.length > limit ? desc.slice(0, limit - 3) + '...' : desc;
  };

  return (
    <div className="skill-selector" id="skill-selector">
      <div className="skill-search-wrapper">
        <svg className="skill-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          ref={searchRef}
          className="skill-search-input"
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="skill-search"
        />
        {search && (
          <button
            className="skill-search-clear"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="4" y1="4" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="4" x2="4" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="skill-categories">
        {loading ? (
          <div className="skill-loading">
            <div className="skill-loading-dot" />
            <div className="skill-loading-dot" />
            <div className="skill-loading-dot" />
          </div>
        ) : categories.length === 0 ? (
          <div className="skill-empty">
            <p>No skills found{search ? ` for "${search}"` : ''}</p>
          </div>
        ) : (
          categories.map((category, catIndex) => (
            <div
              key={category.id}
              className="skill-category"
              style={{ animationDelay: `${catIndex * 60}ms` }}
            >
              <button
                className={`skill-category-header ${expandedCategories.has(category.id) ? 'skill-category-header--expanded' : ''}`}
                onClick={() => toggleCategory(category.id)}
                aria-expanded={expandedCategories.has(category.id)}
                id={`category-${category.id}`}
              >
                <div className="skill-category-info">
                  <span className="skill-category-name">{category.name}</span>
                  <span className="skill-category-count">{category.skills.length} skill{category.skills.length !== 1 ? 's' : ''}</span>
                </div>
                <svg
                  className="skill-category-chevron"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <polyline points="5,6 8,9 11,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {expandedCategories.has(category.id) && (
                <div className="skill-list">
                  {category.skills.map((skill, skillIndex) => (
                    <button
                      key={skill.id}
                      className="skill-item"
                      onClick={() => handleSelectSkill(skill)}
                      style={{ animationDelay: `${skillIndex * 40}ms` }}
                      id={`skill-${skill.id}`}
                    >
                      <div className="skill-item-main">
                        <span className="skill-item-name">{skill.name}</span>
                        <span className="skill-item-desc">{truncateDescription(skill.description)}</span>
                      </div>
                      <svg
                        className="skill-item-arrow"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <polyline points="6,4 10,8 6,12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
