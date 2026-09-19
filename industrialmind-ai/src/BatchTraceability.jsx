import { useState } from "react";

const batchData = {
  "B-204": {
    product: "Precision Component A",
    status: "Investigation",
    quantity: 1250,
    goodUnits: 1178,
    defectiveUnits: 72,
    defectRate: "5.76%",
    startTime: "08:20 AM",
    endTime: "02:45 PM",
    line: "Production Line 02",

    stations: [
      {
        id: "S01",
        name: "Raw Material",
        type: "Material Input",
        status: "normal",
        description:
          "Raw material received and verified before production.",
        details: [
          ["Material", "Aluminium Alloy 6061"],
          ["Supplier", "Supplier Alpha"],
          ["Lot", "RM-6061-42"],
          ["Inspection", "Passed"],
        ],
      },
      {
        id: "S02",
        name: "Machining",
        type: "Production Station",
        status: "normal",
        description:
          "Primary machining operation for the component.",
        details: [
          ["Cycle Time", "42 sec"],
          ["Operators", "3"],
          ["Output", "1,184 units"],
          ["Downtime", "18 min"],
        ],
      },
      {
        id: "S03",
        name: "Surface Finishing",
        type: "Production Station",
        status: "warning",
        description:
          "Surface finishing station associated with the current quality investigation.",
        details: [
          ["Cycle Time", "31 sec"],
          ["Operators", "2"],
          ["Output", "1,178 units"],
          ["Deviation", "+8.4%"],
        ],
      },
      {
        id: "S04",
        name: "Quality Inspection",
        type: "Quality Station",
        status: "alert",
        description:
          "Visual inspection identified an elevated surface-defect frequency.",
        details: [
          ["Inspected", "1,250 units"],
          ["Passed", "1,178 units"],
          ["Defective", "72 units"],
          ["Confidence", "94.7%"],
        ],
      },
    ],

    environment: {
      temperature: "27.8°C",
      humidity: "61%",
      pressure: "101.1 kPa",
      airQuality: "Good",
      dust: "Low",
      station: "S03",
    },

    quality: {
      passRate: "94.24%",
      defectRate: "5.76%",
      mainDefect: "Surface anomaly",
      confidence: "94.7%",
      severity: "Medium",
    },
  },

  "B-203": {
    product: "Precision Component A",
    status: "Completed",
    quantity: 1180,
    goodUnits: 1148,
    defectiveUnits: 32,
    defectRate: "2.71%",
    startTime: "07:55 AM",
    endTime: "01:40 PM",
    line: "Production Line 02",

    stations: [
      {
        id: "S01",
        name: "Raw Material",
        type: "Material Input",
        status: "normal",
        description:
          "Raw material received and verified.",
        details: [
          ["Material", "Aluminium Alloy 6061"],
          ["Supplier", "Supplier Alpha"],
          ["Lot", "RM-6061-39"],
          ["Inspection", "Passed"],
        ],
      },
      {
        id: "S02",
        name: "Machining",
        type: "Production Station",
        status: "normal",
        description:
          "Primary machining operation.",
        details: [
          ["Cycle Time", "41 sec"],
          ["Operators", "3"],
          ["Output", "1,160 units"],
          ["Downtime", "9 min"],
        ],
      },
      {
        id: "S03",
        name: "Surface Finishing",
        type: "Production Station",
        status: "normal",
        description:
          "Surface finishing completed within normal operating range.",
        details: [
          ["Cycle Time", "30 sec"],
          ["Operators", "2"],
          ["Output", "1,148 units"],
          ["Deviation", "+1.2%"],
        ],
      },
      {
        id: "S04",
        name: "Quality Inspection",
        type: "Quality Station",
        status: "normal",
        description:
          "Quality inspection completed successfully.",
        details: [
          ["Inspected", "1,180 units"],
          ["Passed", "1,148 units"],
          ["Defective", "32 units"],
          ["Confidence", "96.1%"],
        ],
      },
    ],

    environment: {
      temperature: "25.9°C",
      humidity: "56%",
      pressure: "101.3 kPa",
      airQuality: "Good",
      dust: "Low",
      station: "S03",
    },

    quality: {
      passRate: "97.29%",
      defectRate: "2.71%",
      mainDefect: "Minor surface variation",
      confidence: "96.1%",
      severity: "Low",
    },
  },

  "B-202": {
    product: "Precision Component B",
    status: "Completed",
    quantity: 1320,
    goodUnits: 1289,
    defectiveUnits: 31,
    defectRate: "2.35%",
    startTime: "08:05 AM",
    endTime: "02:10 PM",
    line: "Production Line 01",

    stations: [
      {
        id: "S01",
        name: "Raw Material",
        type: "Material Input",
        status: "normal",
        description:
          "Raw material received and verified.",
        details: [
          ["Material", "Steel Alloy 304"],
          ["Supplier", "Supplier Beta"],
          ["Lot", "RM-304-18"],
          ["Inspection", "Passed"],
        ],
      },
      {
        id: "S02",
        name: "Machining",
        type: "Production Station",
        status: "normal",
        description:
          "Primary machining operation.",
        details: [
          ["Cycle Time", "39 sec"],
          ["Operators", "3"],
          ["Output", "1,301 units"],
          ["Downtime", "7 min"],
        ],
      },
      {
        id: "S03",
        name: "Surface Finishing",
        type: "Production Station",
        status: "normal",
        description:
          "Finishing operation completed within expected conditions.",
        details: [
          ["Cycle Time", "29 sec"],
          ["Operators", "2"],
          ["Output", "1,289 units"],
          ["Deviation", "+0.8%"],
        ],
      },
      {
        id: "S04",
        name: "Quality Inspection",
        type: "Quality Station",
        status: "normal",
        description:
          "Quality inspection completed.",
        details: [
          ["Inspected", "1,320 units"],
          ["Passed", "1,289 units"],
          ["Defective", "31 units"],
          ["Confidence", "97.2%"],
        ],
      },
    ],

    environment: {
      temperature: "25.4°C",
      humidity: "54%",
      pressure: "101.4 kPa",
      airQuality: "Good",
      dust: "Low",
      station: "S03",
    },

    quality: {
      passRate: "97.65%",
      defectRate: "2.35%",
      mainDefect: "Dimensional variation",
      confidence: "97.2%",
      severity: "Low",
    },
  },
};


function BatchTraceability() {
  const [selectedBatch, setSelectedBatch] =
    useState("B-204");

  const [selectedStation, setSelectedStation] =
    useState("S04");

  const batch = batchData[selectedBatch];

  const station = batch.stations.find(
    (item) => item.id === selectedStation
  );


  return (
    <div className="traceability-page">

      {/* PAGE HEADER */}
      <div className="page-heading">

        <div>

          <div className="eyebrow">
            <span className="live-dot"></span>
            CONNECTED MANUFACTURING INTELLIGENCE
          </div>

          <h2>
            Batch Traceability
          </h2>

          <p>
            Follow a product batch through its
            production process, environment and
            quality outcome.
          </p>

        </div>


        <div className="batch-selector">

          <span>SELECT BATCH</span>

          <select
            value={selectedBatch}
            onChange={(event) => {
              setSelectedBatch(
                event.target.value
              );

              setSelectedStation("S04");
            }}
          >
            {Object.keys(batchData).map(
              (batchId) => (
                <option
                  key={batchId}
                  value={batchId}
                >
                  {batchId}
                </option>
              )
            )}
          </select>

        </div>

      </div>


      {/* BATCH SUMMARY */}
      <div className="trace-summary-grid">

        <TraceMetric
          label="Product"
          value={batch.product}
          sub={batch.line}
        />

        <TraceMetric
          label="Batch Status"
          value={batch.status}
          sub={`${batch.startTime} → ${batch.endTime}`}
          status={batch.status}
        />

        <TraceMetric
          label="Production Quantity"
          value={batch.quantity.toLocaleString()}
          sub="Units produced"
        />

        <TraceMetric
          label="Defect Rate"
          value={batch.defectRate}
          sub={`${batch.defectiveUnits} defective units`}
          warning
        />

      </div>


      {/* TRACEABILITY FLOW */}
      <section className="panel trace-flow-panel">

        <div className="panel-header">

          <div>
            <span className="panel-kicker">
              PRODUCTION JOURNEY
            </span>

            <h3>
              Product → Process → Quality
            </h3>
          </div>

          <span className="trace-badge">
            {selectedBatch}
          </span>

        </div>


        <div className="trace-flow">

          {batch.stations.map(
            (item, index) => (

              <div
                className="trace-node-wrapper"
                key={item.id}
              >

                <button
                  className={`trace-node ${
                    selectedStation === item.id
                      ? "selected"
                      : ""
                  } ${item.status}`}
                  onClick={() =>
                    setSelectedStation(
                      item.id
                    )
                  }
                >

                  <span className="node-number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <span className="node-icon">
                    {item.status === "alert"
                      ? "!"
                      : item.status === "warning"
                      ? "△"
                      : "✓"}
                  </span>

                  <strong>
                    {item.name}
                  </strong>

                  <small>
                    {item.id}
                  </small>

                </button>


                {index <
                  batch.stations.length - 1 && (
                  <div className="trace-connector">
                    <span></span>
                    →
                  </div>
                )}

              </div>
            )
          )}

        </div>

      </section>


      {/* SELECTED STATION */}
      <div className="trace-detail-grid">

        <section className="panel station-detail">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                SELECTED STATION
              </span>

              <h3>
                {station.name}
              </h3>
            </div>

            <span
              className={`station-status ${
                station.status
              }`}
            >
              {station.status === "alert"
                ? "Attention"
                : station.status === "warning"
                ? "Review"
                : "Normal"}
            </span>

          </div>


          <p className="station-description">
            {station.description}
          </p>


          <div className="station-details">

            {station.details.map(
              ([label, value]) => (

                <div
                  className="station-detail-row"
                  key={label}
                >

                  <span>{label}</span>

                  <strong>{value}</strong>

                </div>

              )
            )}

          </div>

        </section>


        {/* ENVIRONMENT */}
        <section className="panel environment-card">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                ENVIRONMENT
              </span>

              <h3>
                Station Conditions
              </h3>
            </div>

            <span className="environment-station">
              {batch.environment.station}
            </span>

          </div>


          <div className="environment-grid">

            <EnvironmentMetric
              label="Temperature"
              value={batch.environment.temperature}
              icon="°"
            />

            <EnvironmentMetric
              label="Humidity"
              value={batch.environment.humidity}
              icon="%"
            />

            <EnvironmentMetric
              label="Pressure"
              value={batch.environment.pressure}
              icon="P"
            />

            <EnvironmentMetric
              label="Air Quality"
              value={batch.environment.airQuality}
              icon="A"
            />

            <EnvironmentMetric
              label="Dust"
              value={batch.environment.dust}
              icon="D"
            />

          </div>

        </section>

      </div>


      {/* QUALITY OUTCOME */}
      <section className="panel quality-outcome-panel">

        <div className="panel-header">

          <div>
            <span className="panel-kicker">
              QUALITY OUTCOME
            </span>

            <h3>
              Batch Quality Assessment
            </h3>
          </div>

          <span className="ai-badge">
            AI
          </span>

        </div>


        <div className="quality-outcome-grid">

          <div className="pass-rate-display">

            <div className="mini-score-ring">
              <div>
                <strong>
                  {batch.quality.passRate
                    .replace("%", "")}
                </strong>

                <span>%</span>
              </div>
            </div>

            <div>
              <span>PASS RATE</span>

              <strong>
                {batch.goodUnits.toLocaleString()} units
              </strong>

              <small>
                of {batch.quantity.toLocaleString()} inspected
              </small>
            </div>

          </div>


          <OutcomeItem
            label="Main Defect"
            value={batch.quality.mainDefect}
          />

          <OutcomeItem
            label="Model Confidence"
            value={batch.quality.confidence}
            good
          />

          <OutcomeItem
            label="Severity"
            value={batch.quality.severity}
            warning
          />

        </div>

      </section>


      {/* CONNECTION TO OTHER MODULES */}
      <section className="panel intelligence-chain">

        <div className="panel-header">

          <div>
            <span className="panel-kicker">
              INTELLIGENCE CONNECTION
            </span>

            <h3>
              Where this data goes next
            </h3>
          </div>

        </div>


        <div className="connection-grid">

          <ConnectionCard
            number="01"
            title="Root Cause Analysis"
            text="Use production and environmental evidence to investigate contributing factors."
            active
          />

          <ConnectionCard
            number="02"
            title="Economic Analysis"
            text="Translate defective units into scrap, rework and potential economic impact."
          />

          <ConnectionCard
            number="03"
            title="Simulation"
            text="Test how production changes could affect throughput and quality."
          />

          <ConnectionCard
            number="04"
            title="Knowledge Base"
            text="Store the batch context and observed outcome for future decisions."
          />

        </div>

      </section>

    </div>
  );
}


/* =====================================================
   SMALL COMPONENTS
===================================================== */

function TraceMetric({
  label,
  value,
  sub,
  warning = false,
}) {
  return (
    <div className="panel trace-metric">

      <span>{label}</span>

      <strong
        className={
          warning ? "trace-warning" : ""
        }
      >
        {value}
      </strong>

      <small>{sub}</small>

    </div>
  );
}


function EnvironmentMetric({
  label,
  value,
  icon,
}) {
  return (
    <div className="environment-metric">

      <div className="environment-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}


function OutcomeItem({
  label,
  value,
  good = false,
  warning = false,
}) {
  return (
    <div className="outcome-item">

      <span>{label}</span>

      <strong
        className={
          good
            ? "outcome-good"
            : warning
            ? "outcome-warning"
            : ""
        }
      >
        {value}
      </strong>

    </div>
  );
}


function ConnectionCard({
  number,
  title,
  text,
  active = false,
}) {
  return (
    <div
      className={`connection-card ${
        active ? "active" : ""
      }`}
    >

      <span>{number}</span>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

      <b>→</b>

    </div>
  );
}


export default BatchTraceability;