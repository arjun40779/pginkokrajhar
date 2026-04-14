interface RulesSection {
  heading: string;
  rules: string[];
}

interface RulesDeclarationProps {
  sections: RulesSection[];
  declaration: string;
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
}

export default function RulesDeclaration({
  sections,
  declaration,
  accepted,
  onAcceptChange,
}: Readonly<RulesDeclarationProps>) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Rules & Regulations</h3>
      <div className="max-h-[500px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        {sections.map((section) => (
          <div key={section.heading} className="mb-4 last:mb-0">
            <h4 className="font-semibold text-gray-900 mb-1">
              {section.heading}
            </h4>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              {section.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Declaration</h4>
        <p className="text-sm text-gray-700 mb-3">{declaration}</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => onAcceptChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-900">
            I agree to all the above rules and regulations{' '}
            <span className="text-red-500">*</span>
          </span>
        </label>
      </div>
    </div>
  );
}

