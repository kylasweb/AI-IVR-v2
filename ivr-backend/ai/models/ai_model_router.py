"""
AI Model Router

Intelligent routing engine for the IMOS Communications Engine that selects
the optimal AI model based on language, dialect, and performance criteria.
Supports YAML configuration for flexible routing rules and automatic fallback.
"""

import logging
import yaml
import asyncio
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class AIModelType(Enum):
    """Types of AI models supported"""
    SPEECH_TO_TEXT = "stt"
    TEXT_TO_SPEECH = "tts"
    NATURAL_LANGUAGE_UNDERSTANDING = "nlu"
    CONVERSATIONAL_AI = "conversational"


class AIProvider(Enum):
    """Available AI providers"""
    PROPRIETARY_ML = "proprietary_ml"
    AI4BHARAT = "ai4bharat"
    GENERIC_CLOUD = "generic_cloud"
    VOCODE = "vocode"


@dataclass
class ModelCapability:
    """Represents a model's capabilities and performance metrics"""
    provider: AIProvider
    model_name: str
    model_type: AIModelType
    supported_languages: List[str]
    supported_dialects: Dict[str, List[str]]  # language -> dialects
    performance_score: float  # 0.0 to 1.0
    cost_per_request: float
    latency_ms: int
    accuracy_score: float
    last_health_check: datetime
    is_healthy: bool


@dataclass
class RoutingRule:
    """Routing rule configuration"""
    language: str
    dialect: Optional[str]
    model_type: AIModelType
    priority_providers: List[AIProvider]
    fallback_enabled: bool
    performance_threshold: float
    cost_limit: Optional[float]


@dataclass
class RoutingDecision:
    """Result of routing decision"""
    selected_provider: AIProvider
    selected_model: str
    confidence_score: float
    estimated_latency: int
    estimated_cost: float
    fallback_used: bool
    reasoning: str


class AIModelRouter:
    """
    Intelligent AI model router that selects optimal models based on
    language, dialect, performance, and cost criteria.
    """

    def __init__(self, config_path: str = "ai/models/routing_config.yaml"):
        self.config_path = config_path
        self.routing_rules: Dict[str, RoutingRule] = {}
        self.model_capabilities: Dict[str, ModelCapability] = {}
        self.provider_connectors: Dict[AIProvider, Any] = {}
        self.health_check_interval = timedelta(minutes=5)
        self.last_health_check = datetime.min

    async def initialize(self) -> bool:
        """Initialize the router with configuration and capabilities"""
        try:
            # Load routing configuration
            await self._load_routing_config()

            # Register available models
            await self._register_model_capabilities()

            # Perform initial health check
            await self._perform_health_checks()

            logger.info("AI Model Router initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize AI Model Router: {e}")
            return False

    async def route_request(
        self,
        language: str,
        dialect: Optional[str] = None,
        model_type: AIModelType = AIModelType.CONVERSATIONAL_AI,
        context: Optional[Dict[str, Any]] = None
    ) -> RoutingDecision:
        """
        Route an AI request to the optimal model based on criteria

        Args:
            language: Language code (e.g., 'ml', 'ta', 'hi')
            dialect: Dialect code (e.g., 'travancore', 'malabar')
            model_type: Type of AI model needed
            context: Additional context for routing decisions

        Returns:
            RoutingDecision with selected provider and model
        """
        try:
            # Find applicable routing rule
            rule = self._find_routing_rule(language, dialect, model_type)

            if not rule:
                # Use default rule
                rule = self._get_default_rule(model_type)

            # Get available models for this rule
            available_models = self._get_available_models(rule, model_type)

            if not available_models:
                raise ValueError(f"No available models for {model_type} in {language}")

            # Select optimal model
            decision = await self._select_optimal_model(
                available_models, rule, context or {}
            )

            logger.info(
                f"Routed {model_type.value} request for {language} "
                f"to {decision.selected_provider.value}:{decision.selected_model}"
            )

            return decision

        except Exception as e:
            logger.error(f"Error routing request: {e}")
            # Return fallback decision
            return await self._get_fallback_decision(language, model_type)

    async def register_provider_connector(self, provider: AIProvider, connector: Any) -> None:
        """Register a provider connector"""
        self.provider_connectors[provider] = connector
        logger.info(f"Registered connector for {provider.value}")

    async def get_provider_connector(self, provider: AIProvider) -> Optional[Any]:
        """Get a registered provider connector"""
        return self.provider_connectors.get(provider)

    async def _load_routing_config(self) -> None:
        """Load routing configuration from YAML"""
        try:
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)

            # Parse routing rules
            for rule_config in config.get('routing_rules', []):
                rule = RoutingRule(
                    language=rule_config['language'],
                    dialect=rule_config.get('dialect'),
                    model_type=AIModelType(rule_config['model_type']),
                    priority_providers=[
                        AIProvider(p) for p in rule_config['priority_providers']
                    ],
                    fallback_enabled=rule_config.get('fallback_enabled', True),
                    performance_threshold=rule_config.get('performance_threshold', 0.7),
                    cost_limit=rule_config.get('cost_limit')
                )

                key = f"{rule.language}:{rule.dialect or '*'}:{rule.model_type.value}"
                self.routing_rules[key] = rule

            logger.info(f"Loaded {len(self.routing_rules)} routing rules")

        except FileNotFoundError:
            logger.warning(f"Routing config not found at {self.config_path}, using defaults")
            await self._create_default_config()
        except Exception as e:
            logger.error(f"Error loading routing config: {e}")
            raise

    async def _create_default_config(self) -> None:
        """Create default routing configuration"""
        default_config = {
            'routing_rules': [
                {
                    'language': 'ml',
                    'model_type': 'conversational',
                    'priority_providers': ['proprietary_ml', 'ai4bharat', 'generic_cloud'],
                    'fallback_enabled': True,
                    'performance_threshold': 0.8,
                    'cost_limit': 0.01
                },
                {
                    'language': 'ta',
                    'model_type': 'conversational',
                    'priority_providers': ['ai4bharat', 'generic_cloud', 'proprietary_ml'],
                    'fallback_enabled': True,
                    'performance_threshold': 0.7
                },
                {
                    'language': 'hi',
                    'model_type': 'conversational',
                    'priority_providers': ['generic_cloud', 'ai4bharat', 'proprietary_ml'],
                    'fallback_enabled': True,
                    'performance_threshold': 0.6
                }
            ]
        }

        # Save default config
        with open(self.config_path, 'w') as f:
            yaml.dump(default_config, f, default_flow_style=False)

        logger.info("Created default routing configuration")

        # Reload with defaults
        await self._load_routing_config()

    async def _register_model_capabilities(self) -> None:
        """Register capabilities of available models"""
        # This would typically load from a database or API
        # For now, we'll define some sample capabilities

        self.model_capabilities = {
            'proprietary_ml_malayalam_v1': ModelCapability(
                provider=AIProvider.PROPRIETARY_ML,
                model_name='malayalam_v1',
                model_type=AIModelType.CONVERSATIONAL_AI,
                supported_languages=['ml'],
                supported_dialects={'ml': ['travancore', 'malabar', 'cochin', 'standard']},
                performance_score=0.95,
                cost_per_request=0.005,
                latency_ms=200,
                accuracy_score=0.92,
                last_health_check=datetime.now(),
                is_healthy=True
            ),
            'ai4bharat_malayalam_stt': ModelCapability(
                provider=AIProvider.AI4BHARAT,
                model_name='malayalam_stt',
                model_type=AIModelType.SPEECH_TO_TEXT,
                supported_languages=['ml'],
                supported_dialects={'ml': ['standard']},
                performance_score=0.88,
                cost_per_request=0.002,
                latency_ms=150,
                accuracy_score=0.89,
                last_health_check=datetime.now(),
                is_healthy=True
            ),
            'generic_cloud_gpt4': ModelCapability(
                provider=AIProvider.GENERIC_CLOUD,
                model_name='gpt4',
                model_type=AIModelType.CONVERSATIONAL_AI,
                supported_languages=['en', 'hi', 'ta', 'te', 'kn', 'ml'],
                supported_dialects={},
                performance_score=0.85,
                cost_per_request=0.01,
                latency_ms=300,
                accuracy_score=0.87,
                last_health_check=datetime.now(),
                is_healthy=True
            )
        }

        logger.info(f"Registered {len(self.model_capabilities)} model capabilities")

    async def _perform_health_checks(self) -> None:
        """Perform health checks on all registered models"""
        # This would check actual model endpoints
        # For now, we'll simulate health checks

        for model_key, capability in self.model_capabilities.items():
            # Simulate health check
            capability.last_health_check = datetime.now()
            capability.is_healthy = True  # Assume healthy for now

        self.last_health_check = datetime.now()
        logger.info("Completed health checks for all models")

    def _find_routing_rule(
        self,
        language: str,
        dialect: Optional[str],
        model_type: AIModelType
    ) -> Optional[RoutingRule]:
        """Find the most specific routing rule for the given criteria"""

        # Try exact match first
        if dialect:
            key = f"{language}:{dialect}:{model_type.value}"
            if key in self.routing_rules:
                return self.routing_rules[key]

        # Try language + wildcard dialect
        key = f"{language}:*:{model_type.value}"
        if key in self.routing_rules:
            return self.routing_rules[key]

        # Try wildcard language
        key = f"*:*:{model_type.value}"
        if key in self.routing_rules:
            return self.routing_rules[key]

        return None

    def _get_default_rule(self, model_type: AIModelType) -> RoutingRule:
        """Get default routing rule"""
        return RoutingRule(
            language='*',
            dialect=None,
            model_type=model_type,
            priority_providers=[AIProvider.GENERIC_CLOUD, AIProvider.AI4BHARAT, AIProvider.PROPRIETARY_ML],
            fallback_enabled=True,
            performance_threshold=0.5,
            cost_limit=None
        )

    def _get_available_models(
        self,
        rule: RoutingRule,
        model_type: AIModelType
    ) -> List[ModelCapability]:
        """Get models that match the routing rule criteria"""
        available_models = []

        for capability in self.model_capabilities.values():
            if capability.model_type != model_type:
                continue
            if not capability.is_healthy:
                continue
            if capability.performance_score < rule.performance_threshold:
                continue
            if rule.cost_limit and capability.cost_per_request > rule.cost_limit:
                continue
            if rule.language != '*' and rule.language not in capability.supported_languages:
                continue
            if rule.dialect and rule.dialect not in capability.supported_dialects.get(rule.language, []):
                continue

            available_models.append(capability)

        return available_models

    async def _select_optimal_model(
        self,
        available_models: List[ModelCapability],
        rule: RoutingRule,
        context: Dict[str, Any]
    ) -> RoutingDecision:
        """Select the optimal model from available options"""

        if not available_models:
            raise ValueError("No available models")

        # Score each model
        scored_models = []
        for model in available_models:
            score = self._calculate_model_score(model, rule, context)
            scored_models.append((model, score))

        # Sort by score (higher is better)
        scored_models.sort(key=lambda x: x[1], reverse=True)

        best_model, best_score = scored_models[0]

        # Check if we need to use fallback
        fallback_used = False
        if best_score < 0.6 and rule.fallback_enabled:  # Low confidence threshold
            # Try to find a backup option
            for model, score in scored_models[1:]:
                if score > best_score + 0.1:  # Significantly better
                    best_model = model
                    best_score = score
                    fallback_used = True
                    break

        return RoutingDecision(
            selected_provider=best_model.provider,
            selected_model=best_model.model_name,
            confidence_score=best_score,
            estimated_latency=best_model.latency_ms,
            estimated_cost=best_model.cost_per_request,
            fallback_used=fallback_used,
            reasoning=f"Selected based on {best_model.provider.value} priority and performance score"
        )

    def _calculate_model_score(
        self,
        model: ModelCapability,
        rule: RoutingRule,
        context: Dict[str, Any]
    ) -> float:
        """Calculate a score for a model based on various factors"""

        score = 0.0

        # Provider priority (0-0.3)
        try:
            priority_index = rule.priority_providers.index(model.provider)
            priority_score = (len(rule.priority_providers) - priority_index) / len(rule.priority_providers)
            score += priority_score * 0.3
        except ValueError:
            score += 0.1  # Low priority if not in list

        # Performance score (0-0.3)
        score += model.performance_score * 0.3

        # Cost efficiency (0-0.2) - lower cost is better
        if rule.cost_limit:
            cost_efficiency = 1.0 - (model.cost_per_request / rule.cost_limit)
            score += max(0, cost_efficiency) * 0.2
        else:
            # If no cost limit, prefer lower cost
            cost_score = 1.0 - min(1.0, model.cost_per_request / 0.01)  # Normalize to $0.01
            score += cost_score * 0.2

        # Latency (0-0.2) - lower latency is better
        latency_score = 1.0 - min(1.0, model.latency_ms / 1000)  # Normalize to 1 second
        score += latency_score * 0.2

        return min(1.0, score)  # Cap at 1.0

    async def _get_fallback_decision(
        self,
        language: str,
        model_type: AIModelType
    ) -> RoutingDecision:
        """Get a fallback routing decision when normal routing fails"""
        return RoutingDecision(
            selected_provider=AIProvider.GENERIC_CLOUD,
            selected_model='fallback_model',
            confidence_score=0.3,
            estimated_latency=500,
            estimated_cost=0.02,
            fallback_used=True,
            reasoning="Fallback due to no suitable models available"
        )

    async def update_model_health(self, model_name: str, is_healthy: bool) -> None:
        """Update health status of a model"""
        if model_name in self.model_capabilities:
            self.model_capabilities[model_name].is_healthy = is_healthy
            self.model_capabilities[model_name].last_health_check = datetime.now()
            logger.info(f"Updated health status for {model_name}: {is_healthy}")

    async def get_routing_stats(self) -> Dict[str, Any]:
        """Get routing statistics"""
        total_models = len(self.model_capabilities)
        healthy_models = sum(1 for m in self.model_capabilities.values() if m.is_healthy)

        return {
            'total_models': total_models,
            'healthy_models': healthy_models,
            'health_percentage': healthy_models / total_models if total_models > 0 else 0,
            'routing_rules_count': len(self.routing_rules),
            'last_health_check': self.last_health_check.isoformat()
        }