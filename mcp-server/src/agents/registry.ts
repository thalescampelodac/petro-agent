export type MonitoredAsset = {
  companyName: string;
  defaultTicker: string;
  description: string;
  sector: string;
  tickers: string[];
};

export type AgentProfile = {
  asset: MonitoredAsset;
  defaultSourceTypes: string[];
  guardrails: string[];
  id: string;
  name: string;
  promptPath: string;
};

const petrobrasAsset: MonitoredAsset = {
  companyName: "Petróleo Brasileiro S.A.",
  defaultTicker: "PETR4",
  description:
    "Empresa brasileira de energia monitorada inicialmente pelo PetroAgent.",
  sector: "Energia",
  tickers: ["PETR4", "PETR3"],
};

export const agentProfiles: AgentProfile[] = [
  {
    asset: petrobrasAsset,
    defaultSourceTypes: ["ri", "news", "manual", "market_event"],
    guardrails: [
      "Não recomendar compra, venda ou manutenção de ativos.",
      "Diferenciar fato publicado, interpretação e hipótese.",
      "Citar fontes internas quando disponíveis.",
      "Evitar chamadas externas desnecessárias.",
    ],
    id: "petroagent-petrobras",
    name: "PetroAgent Petrobras",
    promptPath: "prompts/prompt-base.md",
  },
];

export function getDefaultAgentProfile() {
  return agentProfiles[0];
}

export function getAssetTickers() {
  return getDefaultAgentProfile().asset.tickers;
}

export function normalizeTicker(ticker?: string) {
  const defaultTicker = getDefaultAgentProfile().asset.defaultTicker;
  const normalizedTicker = ticker?.trim().toUpperCase() || defaultTicker;

  return getAssetTickers().includes(normalizedTicker)
    ? normalizedTicker
    : defaultTicker;
}
