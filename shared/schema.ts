/**
 * StormVerse Database Schema
 * Environmental Intelligence Platform Database Structure
 * Copyright (c) 2025 Daniel Guzman - All Rights Reserved
 */

import { pgTable, uuid, text, timestamp, jsonb, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'operator', 'viewer', 'analyst']);
export const fileStatusEnum = pgEnum('file_status', ['unverified', 'verified', 'invalid']);
export const dataTypeEnum = pgEnum('data_type', ['radar', 'satellite', 'hurricane']);
export const complianceStatusEnum = pgEnum('compliance_status', ['compliant', 'violation', 'pending']);
export const agentNameEnum = pgEnum('agent_name', ['STORM', 'ULTRON', 'JARVIS', 'PHOENIX', 'ODIN', 'ECHO', 'MITO', 'VADER']);
export const actionStatusEnum = pgEnum('action_status', ['success', 'failure', 'pending']);

// 1. USERS + PERMISSIONS
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  role: userRoleEnum('role').default('analyst'),
  createdAt: timestamp('created_at').defaultNow()
});

// 2. KMZ/KML FILE INGESTION + METADATA TRACKING
export const geoFiles = pgTable('geo_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  filename: text('filename').notNull(),
  filepath: text('filepath').notNull(),
  uploadTime: timestamp('upload_time').defaultNow(),
  areaCovered: text('area_covered'), // Simplified from GEOGRAPHY type
  arcsecSignature: text('arcsec_signature').notNull(),
  status: fileStatusEnum('status').default('unverified')
});

// 3. NOAA LIVE DATA STREAMING
export const noaaData = pgTable('noaa_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  dataType: dataTypeEnum('data_type'),
  timestamp: timestamp('timestamp').notNull(),
  data: jsonb('data').notNull(),
  sourceUrl: text('source_url'),
  agentTriggeredBy: text('agent_triggered_by')
});

// 4. EPA/FEMA COMPLIANCE ZONES
export const complianceZones = pgTable('compliance_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  geoId: uuid('geo_id').references(() => geoFiles.id),
  zoneName: text('zone_name').notNull(),
  epaCode: text('epa_code'),
  femaRiskLevel: text('fema_risk_level'),
  complianceStatus: complianceStatusEnum('compliance_status'),
  lastChecked: timestamp('last_checked').defaultNow(),
  notes: text('notes')
});

// 5. ARCSEC PROTECTED ASSETS
export const arcsecAssets = pgTable('arcsec_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  assetType: text('asset_type'),
  filename: text('filename'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  hashSha256: text('hash_sha256').notNull(),
  digitalWitness: text('digital_witness').notNull(),
  verified: boolean('verified').default(false)
});

// 6. AI AGENT OPERATIONS LOG
export const agentActivity = pgTable('agent_activity', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentName: agentNameEnum('agent_name'),
  timestamp: timestamp('timestamp').defaultNow(),
  action: text('action'),
  targetResource: text('target_resource'),
  inputData: jsonb('input_data'),
  outputData: jsonb('output_data'),
  status: actionStatusEnum('status')
});

// 7. SYSTEM-WIDE METADATA CONTROL
export const systemMetadata = pgTable('system_metadata', {
  key: text('key').primaryKey(),
  value: text('value')
});