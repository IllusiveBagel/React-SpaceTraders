import type {
    AutomationMode,
    AutomationTemplate,
    AutomationTemplateId,
} from "automation/types";

const automationTemplates: AutomationTemplate[] = [
    {
        id: "mining_loop",
        label: "Mining loop",
        description: "Extract at a mine and sell at the nearest market.",
        mode: "mine_and_sell",
    },
    {
        id: "contract_fulfillment",
        label: "Contract fulfillment",
        description: "Mine contract goods and deliver until complete.",
        mode: "contract_jobs",
    },
];

const getTemplateById = (templateId: string) =>
    automationTemplates.find((template) => template.id === templateId);

const getTemplateIdForMode = (mode: AutomationMode): AutomationTemplateId => {
    return mode === "contract_jobs" ? "contract_fulfillment" : "mining_loop";
};

export { automationTemplates, getTemplateById, getTemplateIdForMode };
