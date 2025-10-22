# DCS Integration Guide

## Overview

This batch scheduler supports integration with major Distributed Control Systems (DCS) for real-time process data synchronization. The system provides flexible connectivity options to work with Yokogawa, Siemens, Honeywell, ABB, and other major DCS vendors.

## Supported Integration Methods

### 1. OPC UA (Recommended)
**Best for:** Modern installations, cross-platform compatibility, secure communications

**Vendors Supporting OPC UA:**
- Yokogawa CENTUM VP (R6.0+)
- Siemens PCS 7 / PCS neo
- Honeywell Experion PKS
- ABB System 800xA
- Emerson DeltaV

**Advantages:**
- Industry standard, vendor-neutral
- Built-in security (encryption, authentication)
- Platform independent
- Rich data modeling
- Session-based reliability

**Configuration Required:**
```javascript
{
  "connectionType": "OPC_UA",
  "opcServerUrl": "opc.tcp://dcs-server.company.com:4840",
  "opcNamespace": "2", // or namespace URI
  "opcUsername": "batch_scheduler",
  "opcPassword": "[encrypted]",
  "trustServerCert": false,
  "certificatePath": "/path/to/client-cert.pem"
}
```

### 2. OPC DA (Legacy)
**Best for:** Older DCS installations (pre-2010)

**Note:** Requires Windows environment and DCOM configuration

**Configuration Required:**
```javascript
{
  "connectionType": "OPC_DA",
  "opcServerUrl": "Yokogawa.ExaopcData.1", // ProgID
  "opcUsername": "domain\\user",
  "opcPassword": "[encrypted]"
}
```

### 3. REST API
**Best for:** Modern DCS with web services, cloud-connected systems

**Yokogawa Example:**
```javascript
{
  "connectionType": "REST_API",
  "apiBaseUrl": "https://centum-api.company.com/api/v1",
  "apiAuthType": "BEARER",
  "apiKey": "[your-api-key]"
}
```

**Siemens Example:**
```javascript
{
  "connectionType": "REST_API",
  "apiBaseUrl": "https://pcs7-web.company.com/webapi",
  "apiAuthType": "BASIC",
  "opcUsername": "api_user",
  "opcPassword": "[encrypted]"
}
```

### 4. Database Access
**Best for:** Historical data, batch records, alarm logs

**Siemens PCS 7 (SQL Server):**
```javascript
{
  "connectionType": "DATABASE",
  "dbType": "MSSQL",
  "dbConnectionString": "Server=pcs7-db;Database=ProcessHistory;User Id=reader;Password=[encrypted];"
}
```

**Configuration Required:**
- Read-only database user
- Network connectivity to DB server
- Proper firewall rules

### 5. Proprietary SDKs
**Best for:** Advanced integration, vendor-specific features

**Yokogawa Integration Gateway:**
- Requires licensing
- Uses Yokogawa's Application Integration Gateway
- Direct access to tag database and trend data

**Siemens OpenPCS 7:**
- COM/DCOM based
- WinCC API access
- Batch control integration

## Network Architecture

### Security Zones

```
┌─────────────────────────────────────────────────────────┐
│                    Corporate Network                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Batch Scheduler Application              │  │
│  │         (Web Server + Database)                  │  │
│  └───────────────────┬──────────────────────────────┘  │
└────────────────────────┼────────────────────────────────┘
                         │
                    Firewall / DMZ
                         │
┌────────────────────────┼────────────────────────────────┐
│                  Process Network (DMZ)                  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Integration Server / Edge Gateway           │  │
│  │      - OPC Server                                │  │
│  │      - Data Historian                            │  │
│  │      - API Gateway                               │  │
│  └───────────────────┬──────────────────────────────┘  │
└────────────────────────┼────────────────────────────────┘
                         │
                    Firewall (Strict)
                         │
┌────────────────────────┼────────────────────────────────┐
│              Production Control Network                  │
│              (Isolated, Air-Gapped)                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ DCS Node │  │ DCS Node │  │ DCS Node │             │
│  │ Server 1 │  │ Server 2 │  │ Server 3 │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

### Recommended Approach

**Option A: Edge Gateway (Recommended)**
- Deploy Kepware, Ignition, or custom edge server in DMZ
- Edge gateway connects to DCS (one-way read)
- Batch scheduler connects to edge gateway
- Benefits: Security isolation, vendor abstraction, caching

**Option B: Direct Connection**
- Batch scheduler connects directly to DCS OPC server
- Requires firewall rules and network segmentation
- Use for smaller installations

**Option C: Data Historian**
- Connect to existing historian (PI, PHD, InfoPlus.21)
- Leverage existing infrastructure
- Good for historical data, slower updates

## Vendor-Specific Integration

### Yokogawa CENTUM VP / DCS

#### OPC UA Connection
```
Server URL: opc.tcp://[CENTUM_Server]:4840
Namespace: Typically namespace 2 or 3
Tags Format: "FIC_101.PV", "TIC_201.SP"
```

#### Available Data
- Real-time tag values (PV, SP, MV, Status)
- Alarm data
- Trend data (via historian)
- Batch records (via Exaquantum)

#### Special Considerations
- Requires "OPC UA Server" license
- Configure OPC UA endpoints in System View
- Set up user authentication in Security Configuration

#### Example Tag Mapping
```javascript
{
  "tagName": "R101_TEMP.PV",
  "tagPath": "Plant/Reactors/R101/Temperature",
  "dataType": "FLOAT",
  "unit": "°C",
  "mappingType": "EQUIPMENT",
  "equipmentId": "[your-equipment-id]",
  "customField": "temperature"
}
```

### Siemens PCS 7 / PCS neo

#### OPC UA Connection
```
Server URL: opc.tcp://[PCS7_Server]:4840
Namespace: Check WinCC OPC UA configuration
Tags Format: "::R101:FIC101.PV"
```

#### Available Data
- Process tags via WinCC
- Archives (process value archive, alarm archive)
- Batch data (via BatchControl)
- Recipe management

#### Special Considerations
- Requires "OPC Server" option
- Check WinCC runtime licenses
- Configure security in SIMATIC Manager

#### Database Access (Alternative)
```sql
-- Example query for tag values from WinCC archive
SELECT
    TagName,
    TimeStamp,
    RealValue,
    Quality
FROM Runtime.dbo.PDE_TAG_VALUES
WHERE TagName = 'R101_TEMP'
    AND TimeStamp >= DATEADD(hour, -1, GETDATE())
ORDER BY TimeStamp DESC
```

### Honeywell Experion PKS

#### OPC UA Connection
```
Server URL: opc.tcp://[Experion_Server]:4845
Namespace: Check PHD configuration
Tags Format: "R101.TEMP.PV"
```

#### Available Data
- Real-time process data
- PHD (Process History Database)
- Alarm & Event data
- Batch execution data

### ABB System 800xA

#### OPC UA Connection
```
Server URL: opc.tcp://[800xA_Server]:4840
Namespace: Check Aspect Directory
Tags Format: "PLANT/AREA/R101/TEMP"
```

#### Available Data
- Process objects and attributes
- Historian data
- Alarm & Event System
- Batch management data

## Tag Mapping Configuration

### Equipment Mapping Example
```javascript
{
  "equipment": {
    "id": "equip-001",
    "name": "Reactor R-101",
    "tags": [
      {
        "tagName": "R101_TEMP.PV",
        "description": "Reactor temperature",
        "dataType": "FLOAT",
        "unit": "°C",
        "mappingType": "EQUIPMENT",
        "customField": "temperature"
      },
      {
        "tagName": "R101_PRESSURE.PV",
        "description": "Reactor pressure",
        "dataType": "FLOAT",
        "unit": "bar",
        "mappingType": "EQUIPMENT",
        "customField": "pressure"
      },
      {
        "tagName": "R101_RUNNING",
        "description": "Equipment running status",
        "dataType": "BOOL",
        "mappingType": "EQUIPMENT",
        "customField": "isRunning"
      }
    ]
  }
}
```

### Material Inventory Mapping
```javascript
{
  "material": {
    "id": "mat-001",
    "name": "Hydrogen Peroxide",
    "tags": [
      {
        "tagName": "TANK_101_LEVEL",
        "description": "H2O2 tank level",
        "dataType": "FLOAT",
        "unit": "%",
        "mappingType": "MATERIAL",
        "customField": "tankLevel"
      },
      {
        "tagName": "TANK_101_VOLUME",
        "description": "H2O2 volume",
        "dataType": "FLOAT",
        "unit": "L",
        "mappingType": "MATERIAL",
        "materialId": "mat-001"
      }
    ]
  }
}
```

### Batch Status Mapping
```javascript
{
  "batch": {
    "tags": [
      {
        "tagName": "BATCH_STATUS",
        "description": "Current batch status",
        "dataType": "INT",
        "mappingType": "BATCH",
        "customField": "status"
      },
      {
        "tagName": "BATCH_PHASE",
        "description": "Current phase",
        "dataType": "STRING",
        "mappingType": "BATCH",
        "customField": "currentPhase"
      }
    ]
  }
}
```

## Data Synchronization

### Sync Modes

**1. Polling (Default)**
- Reads tags at configured interval (default: 60 seconds)
- Good for: Historical data, non-critical monitoring
- Lower DCS load

**2. Subscription (OPC UA)**
- Server notifies on data change
- Good for: Real-time monitoring, alarms
- More efficient for fast-changing data

**3. On-Demand**
- Manual refresh or API-triggered
- Good for: Batch reports, one-time queries

### Configuration Example
```javascript
{
  "syncEnabled": true,
  "syncInterval": 60, // seconds
  "syncMode": "POLLING", // or "SUBSCRIPTION"
  "tagsToSync": ["R101_*", "BATCH_*"], // glob patterns
  "qualityThreshold": "GOOD" // Only sync good-quality data
}
```

## Security Best Practices

### Authentication
- Use dedicated service accounts
- Rotate credentials regularly
- Encrypt passwords in database
- Use certificate-based auth for OPC UA

### Network Security
- Implement firewall rules (allowlist only)
- Use VPN for remote access
- Deploy in DMZ when possible
- Monitor network traffic

### Access Control
- Read-only access to DCS
- Audit all connections
- Log all tag reads
- Implement rate limiting

### Compliance
- Follow ISA-95 guidelines
- Maintain 21 CFR Part 11 compliance (audit trails)
- Document all integrations
- Regular security reviews

## Troubleshooting

### Common Issues

#### OPC UA Connection Failed
```
Error: Connection timeout
```
**Solutions:**
- Check network connectivity: `ping [dcs-server]`
- Verify OPC UA server is running
- Check firewall rules (port 4840)
- Verify credentials

#### Certificate Trust Issues
```
Error: BadSecurityChecksFailed
```
**Solutions:**
- Trust server certificate
- Install client certificate on DCS
- Use SecurityMode None for testing (not production!)

#### Tag Not Found
```
Error: Tag 'R101_TEMP.PV' not found
```
**Solutions:**
- Browse OPC server with UaExpert tool
- Verify tag name and namespace
- Check tag is exposed by OPC server
- Verify permissions

#### Data Quality Issues
```
Quality: BAD or UNCERTAIN
```
**Solutions:**
- Check DCS I/O health
- Verify tag configuration in DCS
- Check sensor/field device status
- Review DCS diagnostic logs

## Performance Optimization

### Best Practices
- Limit number of tags (< 1000 per integration)
- Use appropriate sync intervals
- Implement caching layer
- Use subscription for critical tags
- Batch tag reads when possible

### Monitoring
- Track sync success rate
- Monitor response times
- Log failed reads
- Alert on connection failures

## Implementation Checklist

### Pre-Integration
- [ ] Identify DCS vendor and version
- [ ] Determine available connectivity options
- [ ] Obtain necessary licenses
- [ ] Document network topology
- [ ] Define required tags and mappings
- [ ] Plan security approach

### Network Setup
- [ ] Configure firewall rules
- [ ] Set up DMZ if needed
- [ ] Install edge gateway (if using)
- [ ] Test network connectivity
- [ ] Configure VPN (if remote)

### DCS Configuration
- [ ] Enable OPC UA server
- [ ] Create service account
- [ ] Configure security/authentication
- [ ] Expose required tags
- [ ] Test OPC connectivity with tools

### Application Setup
- [ ] Create integration configuration
- [ ] Map tags to equipment/materials
- [ ] Configure sync settings
- [ ] Test connection
- [ ] Validate data quality
- [ ] Set up monitoring/alerts

### Go-Live
- [ ] Perform UAT
- [ ] Document configuration
- [ ] Train operators
- [ ] Monitor for 24 hours
- [ ] Optimize sync intervals
- [ ] Enable production sync

## Support & Resources

### Tools
- **UaExpert** - OPC UA client for testing
- **Kepware** - Universal OPC server/gateway
- **Ignition** - SCADA/MES platform
- **Node-RED** - Visual integration tool

### Documentation Links
- OPC Foundation: https://opcfoundation.org
- Yokogawa CENTUM VP OPC: [Vendor documentation]
- Siemens PCS 7 OpenPCS 7: [Vendor documentation]
- ISA-95: Enterprise-Control System Integration

### Vendor Contacts
- Yokogawa Support: Contact your regional office
- Siemens Support: https://support.industry.siemens.com
- Honeywell Support: https://process.honeywell.com

---

## Example: Quick Start with Yokogawa CENTUM VP

### Step 1: Enable OPC UA on CENTUM
1. Open System View
2. Navigate to OPC UA Server configuration
3. Enable OPC UA endpoint
4. Create user account with read permissions
5. Note the server URL and namespace

### Step 2: Create Integration in Batch Scheduler
```javascript
POST /api/integrations
{
  "name": "CENTUM VP - Plant A",
  "vendor": "YOKOGAWA",
  "systemType": "CENTUM VP R6.09",
  "connectionType": "OPC_UA",
  "opcServerUrl": "opc.tcp://centum-server:4840",
  "opcNamespace": "2",
  "opcUsername": "batch_scheduler",
  "opcPassword": "[your-password]",
  "syncEnabled": false, // Start disabled for testing
  "syncInterval": 60
}
```

### Step 3: Add Tag Mappings
```javascript
POST /api/integrations/[integration-id]/tags
{
  "tagName": "R101_TEMP.PV",
  "dataType": "FLOAT",
  "unit": "°C",
  "mappingType": "EQUIPMENT",
  "equipmentId": "[your-equipment-id]",
  "customField": "temperature"
}
```

### Step 4: Test Connection
```javascript
POST /api/integrations/[integration-id]/test-connection
```

### Step 5: Enable Sync
```javascript
PATCH /api/integrations/[integration-id]
{
  "syncEnabled": true
}
```

---

**For additional assistance or custom integration needs, contact your system administrator or DCS vendor.**
