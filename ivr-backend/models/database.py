"""
Database configuration and connection for AI IVR Platform
"""

import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from typing import AsyncGenerator
import logging

logger = logging.getLogger(__name__)

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://your_db_user:your_db_password@your_db_host:5432/your_db_name?sslmode=require")

# Create async engine
engine = create_async_engine(
    DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://").replace("?sslmode=require", ""),
    echo=False,  # Set to True for SQL query logging
    pool_size=10,
    max_overflow=20,
    connect_args={"ssl": "require"} if "sslmode=require" in DATABASE_URL else {}
)

# Create async session factory
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

class VoiceProfile(Base):
    __tablename__ = "voiceprofile"

    id = Column(String, primary_key=True)
    userId = Column(String, unique=True, nullable=False)
    displayName = Column(String, nullable=False)
    language = Column(String, default="ml")
    voiceType = Column(String, default="adult")
    gender = Column(String)

    # Voice characteristics
    fundamentalFrequency = Column(Float)
    formantFeatures = Column(JSON)
    spectralFeatures = Column(JSON)
    prosodyFeatures = Column(JSON)

    # Malayalam-specific features
    malayalamPhonemes = Column(JSON)
    dialectMarkers = Column(JSON)
    codeSwitch = Column(Boolean, default=False)

    # Biometric data
    voiceprintHash = Column(String, nullable=False)
    confidenceThreshold = Column(Float, default=0.8)

    # Training metadata
    enrollmentQuality = Column(Float, default=0.0)
    sampleCount = Column(Integer, default=0)
    modelVersion = Column(String, default="1.0")

    # Usage statistics
    verificationCount = Column(Integer, default=0)
    successfulVerifications = Column(Integer, default=0)
    failedVerifications = Column(Integer, default=0)
    lastVerified = Column(DateTime)

    # Security and compliance
    encryptionKey = Column(String)
    isActive = Column(Boolean, default=True)
    gdprConsent = Column(Boolean, default=False)
    dataRetentionExpiry = Column(DateTime)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())

class Workflow(Base):
    __tablename__ = "workflow"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, default="CUSTOM")
    isActive = Column(Boolean, default=True)
    createdAt = Column(DateTime, default=func.now())
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())

class SystemSetting(Base):
    __tablename__ = "systemsetting"

    id = Column(String, primary_key=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text, nullable=False)
    type = Column(String, nullable=False)  # string, number, boolean, json
    category = Column(String, nullable=False)  # voice, integration, system, etc.
    description = Column(Text)
    isEncrypted = Column(Boolean, default=False)
    updatedBy = Column(String)
    updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())
    createdAt = Column(DateTime, default=func.now())

async def init_db():
    """Initialize the database"""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session"""
    async with AsyncSession(engine) as session:
        try:
            yield session
        finally:
            await session.close()