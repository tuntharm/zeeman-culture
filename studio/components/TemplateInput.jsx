import React, { useId } from 'react';
import { set } from 'sanity';
import { COVER_TEMPLATES, renderCover } from '../../lib/cover.mjs';
import '../studio.css';

export default function TemplateInput(props) {
  const { value, onChange, readOnly, elementProps = {} } = props;
  const instanceId = useId();
  return (
    <div className="zeeman-template-options" role="radiogroup" aria-label="Cover design" aria-describedby={elementProps['aria-describedby']}>
      {COVER_TEMPLATES.map((template, index) => (
        <label key={template.value} className={`zeeman-template-option${value === template.value ? ' is-selected' : ''}`}>
          <input
            {...elementProps}
            ref={index === 0 ? elementProps.ref : undefined}
            id={index === 0 ? elementProps.id : `${elementProps.id || instanceId}-${template.value}`}
            name={`cover-template-${instanceId}`}
            type="radio"
            value={template.value}
            checked={value === template.value}
            disabled={readOnly}
            onChange={() => onChange(set(template.value))}
          />
          <span className="zeeman-template-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: renderCover({ template: template.value }, { idPrefix: `${instanceId}-${template.value}` }) }} />
          <span className="zeeman-template-title">{template.title}</span>
          <span className="zeeman-template-description">{template.description}</span>
        </label>
      ))}
    </div>
  );
}
