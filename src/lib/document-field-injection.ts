export interface CheckboxOption {
  label: string;
  value: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}

export interface CheckboxGroupField {
  type: 'checkbox-group';
  replaceText: string;
  replaceUntil?: string;
  fieldName: string;
  title?: string;
  options: CheckboxOption[];
  columns?: 1 | 2;
  sendToBackend?: boolean;
}

export type FormFieldConfig = CheckboxGroupField;

export function injectFormFields(
  html: string,
  formFields: FormFieldConfig[],
  renderStatic: boolean = false
): string {
  if (!html || formFields.length === 0) return html;

  let processed = html;

  formFields.forEach((field) => {
    if (field.type === 'checkbox-group') {
      const marker = `[CHECKBOX_GROUP:${field.fieldName}]`;

      if (field.replaceUntil) {
        const parts = processed.split(/(<[^>]+>)/g);

        let startIdx = -1;
        let endIdx = -1;
        let inCheckboxSection = false;

        parts.forEach((part, idx) => {
          if (part.includes(field.replaceText)) {
            startIdx = idx;
            inCheckboxSection = true;
          }
          if (
            inCheckboxSection &&
            field.replaceUntil &&
            part.includes(field.replaceUntil)
          ) {
            for (let i = idx - 1; i >= 0; i--) {
              if (parts[i].match(/^<(p|h[1-6]|div)/i)) {
                endIdx = i;
                break;
              }
            }
            inCheckboxSection = false;
          }
        });

        if (startIdx !== -1 && endIdx !== -1) {
          const before = parts.slice(0, startIdx).join('');
          const after = parts.slice(endIdx).join('');

          const openTags = [];
          const beforeParts = before.split(/(<[^>]+>)/g);
          for (const part of beforeParts) {
            if (part.match(/^<(\w+)[^>]*>$/)) {
              const tagName = part.match(/^<(\w+)/)?.[1];
              if (
                tagName &&
                !['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
                  tagName
                )
              ) {
                openTags.push(tagName);
              }
            } else if (part.match(/^<\/(\w+)>$/)) {
              const tagName = part.match(/^<\/(\w+)>$/)?.[1];
              if (tagName) {
                const index = openTags.lastIndexOf(tagName);
                if (index !== -1) {
                  openTags.splice(index, 1);
                }
              }
            }
          }

          const closingTags = openTags
            .reverse()
            .map((tag) => `</${tag}>`)
            .join('');

          const replacement = renderStatic
            ? buildStaticCheckboxGroup(field)
            : marker;
          processed = before + closingTags + replacement + after;
        } else {
          const replacement = renderStatic
            ? buildStaticCheckboxGroup(field)
            : marker;
          processed = processed.replace(field.replaceText, replacement);
        }
      } else {
        const replacement = renderStatic
          ? buildStaticCheckboxGroup(field)
          : marker;
        processed = processed.replace(field.replaceText, replacement);
      }
    }
  });

  return processed;
}

function buildStaticCheckboxGroup(field: CheckboxGroupField): string {
  const title = field.title || field.replaceText;

  const checkboxItems = field.options
    .map(
      (option) => `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="width: 16px; height: 16px; border: 2px solid #3b82f6; border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; background-color: #3b82f6; flex-shrink: 0; vertical-align: middle;">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3L4.5 8.5L2 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span style="font-size: 14px; line-height: 16px;">${option.label}</span>
      </div>
    `
    )
    .join('');

  return `
    <div style="margin-bottom: 16px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f9fafb;">
      <div style="font-weight: 600; margin-bottom: 12px; font-size: 16px; font-family: inherit;">${title}</div>
      <div style="display: flex; flex-direction: column; gap: 8px; font-weight: normal;">
        ${checkboxItems}
      </div>
    </div>
  `;
}

export function getReleaseOfInformationFields(): FormFieldConfig[] {
  return [
    {
      type: 'checkbox-group',
      replaceText: 'Types of Information to be Shared',
      replaceUntil: 'Purpose of Disclosure',
      fieldName: 'informationTypes',
      title: 'Types of Information to be Shared',
      columns: 1,
      sendToBackend: false,
      options: [
        {
          label: 'Entire Treatment Record',
          value: 'entire',
          defaultChecked: true,
          disabled: true,
        },
        {
          label: 'Current Status and location',
          value: 'status',
          defaultChecked: true,
          disabled: true,
        },
        {
          label: 'Billing Statements',
          value: 'billing',
          defaultChecked: true,
          disabled: true,
        },
        {
          label: 'Other',
          value: 'other',
          defaultChecked: true,
          disabled: true,
        },
      ],
    },
    {
      type: 'checkbox-group',
      replaceText: 'Purpose of Disclosure',
      replaceUntil: 'Duration and Revocation',
      fieldName: 'disclosurePurposes',
      title: 'Purpose of Disclosure',
      columns: 1,
      sendToBackend: false,
      options: [
        {
          label: 'Continuity of Care',
          value: 'continuity',
          defaultChecked: true,
          disabled: true,
        },
        {
          label: 'Emergency Management',
          value: 'emergency',
          defaultChecked: true,
          disabled: true,
        },
        {
          label: 'Account Management',
          value: 'account',
          defaultChecked: true,
          disabled: true,
        },
        {
          label: 'Other',
          value: 'other',
          defaultChecked: true,
          disabled: true,
        },
      ],
    },
  ];
}
