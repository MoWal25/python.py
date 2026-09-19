import { useState } from "react";

const investigations = {
  "B-204": {
    product: "Precision Component A",
    defect: "Surface anomaly",
    defectRate: "5.76%",
    affectedUnits: 72,
    station: "S03 — Surface Finishing",
    confidence: "87.4%",

    summary:
      "The AI investigation identified several conditions that coincide with the elevated defect frequency in Batch B-204. Surface finishing deviation and environmental temperature are currently the strongest signals.",

    factors: [
      {
        name: "Surface Finishing Deviation",
        value: 82,
        category: "Production",
        level: "High",
        description:
          "Station S03 recorded an 8.4% process deviation during this batch.",
      },
      {
        name: "Temperature",
        value: 67,
        category: "Environment",
        level: "Medium",
        description:
          "Temperature was higher than the reference range observed in previous batches.",
      },
      {
        name: "Cycle Time Variation",
        value: 51,
        category: "Production",
        level: "Medium",
        description:
          "Cycle time increased compared with the previous completed batch.",
      },
      {
        name: "Humidity",
        value: 34,
        category: "Environment",
        level: "Low",
        description:
          "Humidity shows a weaker association with the current defect pattern.",
      },
    ],

    evidence: [
      {
        type: "Production",
        title: "S03 process deviation",
        value: "+8.4%",
        detail:
          "Observed during Surface Finishing for this batch.",
        severity: "high",
      },
      {
        type: "Environment",
        title: "Temperature",
        value: "27.8°C",
        detail:
          "Above the reference condition observed in B-203.",
        severity: "medium",
      },
      {
        type: "Quality",
        title: "Surface anomaly",
        value: "72 units",
        detail:
          "Defect frequency increased compared with the previous batch.",
        severity: "high",
      },
      {
        type: "Traceability",
        title: "Station correlation",
        value: "S03",
        detail:
          "The affected process stage is identified through batch traceability.",
        severity: "medium",
      },
    ],
  },

  "B-203": {
    product: "Precision Component A",
    defect: "Minor surface variation",
    defectRate: "2.71%",
    affectedUnits: 32,
    station: "S03 — Surface Finishing",
    confidence: "91.2%",

    summary:
      "Batch B-203 shows a comparatively lower defect frequency. The available evidence does not indicate a strong abnormal process condition.",

    factors: [
      {
        name: "Cycle Time Variation",
        value: 29,
        category: "Production",
        level: "Low",
        description:
          "Cycle time remained close to the expected operating range.",
      },
      {
        name: "Temperature",
        value: 24,
        category: "Environment",
        level: "Low",
        description:
          "Environmental temperature remained within the observed reference range.",
      },
      {
        name: "Surface Finishing",
        value: 21,
        category: "Production",
        level: "Low",
        description:
          "No significant process deviation was observed.",
      },
      {
        name: "Humidity",
        value: 16,
        category: "Environment",
        level: "Low",
        description:
          "No strong association detected.",
      },
    ],

    evidence: [
      {
        type: "Production",
        title: "S03 process deviation",
        value: "+1.2%",
        detail:
          "Process remained close to expected operating conditions.",
        severity: "low",
      },
      {
        type: "Environment",
        title: "Temperature",
        value: "25.9°C",
        detail:
          "Within the observed reference range.",
        severity: "low",
      },
      {
        type: "Quality",
        title: "Surface variation",
        value: "32 units",
        detail:
          "Lower defect frequency than B-204.",
        severity: "medium",
      },
      {
        type: "Traceability",
        title: "Station",
        value: "S03",
        detail:
          "Same production stage remains relevant for comparison.",
        severity: "low",
      },
    ],
  },

  "B-202": {
    product: "Precision Component B",
    defect: "Dimensional variation",
    defectRate: "2.35%",
    affectedUnits: 31,
    station: "S04 — Quality Inspection",
    confidence: "84.6%",

    summary:
      "The investigation found no dominant abnormal signal. Dimensional variation appears distributed across the production process rather than concentrated around one strong factor.",

    factors: [
      {
        name: "Machining Cycle Time",
        value: 39,
        category: "Production",
        level: "Low",
        description:
          "Cycle time remained within the expected range.",
      },
      {
        name: "Temperature",
        value: 26,
        category: "Environment",
        level: "Low",
        description:
          "Temperature remained stable during production.",
      },
      {
        name: "Material Variation",
        value: 23,
        category: "Material",
        level: "Low",
        description:
          "No strong material-related signal was detected.",
      },
      {
        name: "Humidity",
        value: 17,
        category: "Environment",
        level: "Low",
        description:
          "Weak association with the observed quality pattern.",
      },
    ],

    evidence: [
      {
        type: "Production",
        title: "Machining cycle time",
        value: "39 sec",
        detail:
          "Within expected operating conditions.",
        severity: "low",
      },
      {
        type: "Environment",
        title: "Temperature",
        value: "25.4°C",
        detail:
          "Stable environmental condition.",
        severity: "low",
      },
      {
        type: "Quality",
        title: "Dimensional variation",
        value: "31 units",
        detail:
          "Detected during final inspection.",
        severity: "medium",
      },
      {
        type: "Traceability",
        title: "Inspection station",
        value: "S04",
        detail:
          "Issue was identified during final quality inspection.",
        severity: "medium",
      },
    ],
  },
};

function RootCauseAnalysis() {
  const [selectedBatch, setSelectedBatch] = useState("B-204");
  const [selectedFactor, setSelectedFactor] = useState(0);

  const investigation = investigations[selectedBatch];
  const factor = investigation.factors[selectedFactor];

  return (
    <div className="root-cause-page">

      {/* HEADER */}

      <div className="page-heading">

        <div>
          <div className="eyebrow">
            <span className="live-dot"></span>
            AI INVESTIGATION ENGINE
          </div>

          <h2>Root Cause Analysis</h2>

          <p>
            Investigate potential contributing factors
            using production, environmental and quality
            evidence.
          </p>
        </div>

        <div className="batch-selector">

          <span>INVESTIGATE BATCH</span>

          <select
            value={selectedBatch}
            onChange={(event) => {
              setSelectedBatch(event.target.value);
              setSelectedFactor(0);
            }}
          >
            {Object.keys(investigations).map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>

        </div>

      </div>


      {/* INVESTIGATION STATUS */}

      <div className="investigation-status">

        <div className="investigation-status-icon">
          AI
        </div>

        <div className="investigation-status-text">

          <span>INVESTIGATION COMPLETE</span>

          <strong>
            {investigation.defect}
          </strong>

          <small>
            {investigation.affectedUnits} affected units
            detected in {selectedBatch}
          </small>

        </div>

        <div className="investigation-confidence">

          <span>CONFIDENCE</span>

          <strong>
            {investigation.confidence}
          </strong>

        </div>

      </div>


      {/* AI SUMMARY */}

      <section className="panel investigation-summary">

        <div className="panel-header">

          <div>
            <span className="panel-kicker">
              AI INVESTIGATION
            </span>

            <h3>What the system found</h3>
          </div>

          <span className="ai-badge">
            AI
          </span>

        </div>

        <p>
          {investigation.summary}
        </p>

        <div className="summary-warning">

          <span>i</span>

          <div>
            <strong>
              Evidence-based assessment
            </strong>

            <small>
              These factors represent observed
              associations and investigation signals.
              They should not be interpreted as automatic
              proof of causation.
            </small>
          </div>

        </div>

      </section>


      {/* FACTOR ANALYSIS */}

      <div className="root-cause-grid">

        <section className="panel factors-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                CONTRIBUTING FACTORS
              </span>

              <h3>Factor Analysis</h3>
            </div>

            <span className="factor-count">
              {investigation.factors.length} signals
            </span>

          </div>

          <div className="factor-list">

            {investigation.factors.map((item, index) => (

              <button
                key={item.name}
                className={`factor-row ${
                  selectedFactor === index
                    ? "selected"
                    : ""
                }`}
                onClick={() => setSelectedFactor(index)}
              >

                <div className="factor-number">
                  0{index + 1}
                </div>

                <div className="factor-main">

                  <div className="factor-title-row">

                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      {item.category}
                    </span>

                  </div>

                  <div className="factor-bar">

                    <div
                      style={{
                        width: `${item.value}%`,
                      }}
                    />

                  </div>

                </div>

                <div className="factor-score">

                  <strong>
                    {item.value}
                  </strong>

                  <small>
                    signal
                  </small>

                </div>

              </button>

            ))}

          </div>

        </section>


        {/* SELECTED FACTOR */}

        <section className="panel factor-detail-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                SELECTED SIGNAL
              </span>

              <h3>
                {factor.name}
              </h3>
            </div>

            <span
              className={`factor-level ${
                factor.level.toLowerCase()
              }`}
            >
              {factor.level}
            </span>

          </div>


          <div className="factor-score-large">

            <div className="factor-circle">

              <strong>
                {factor.value}
              </strong>

              <span>SIGNAL</span>

            </div>

            <div>

              <span>CATEGORY</span>

              <strong>
                {factor.category}
              </strong>

            </div>

          </div>


          <div className="factor-description">

            <span>WHY IT MATTERS</span>

            <p>
              {factor.description}
            </p>

          </div>


          <div className="factor-assessment">

            <div className="assessment-icon">
              ✓
            </div>

            <div>

              <strong>
                Investigation signal
              </strong>

              <small>
                This factor should be reviewed alongside
                the other available production and
                environmental evidence.
              </small>

            </div>

          </div>

        </section>

      </div>


      {/* EVIDENCE */}

      <section className="panel evidence-panel">

        <div className="panel-header">

          <div>

            <span className="panel-kicker">
              SUPPORTING EVIDENCE
            </span>

            <h3>Evidence Timeline</h3>

          </div>

          <span className="trace-badge">
            {selectedBatch}
          </span>

        </div>


        <div className="evidence-grid">

          {investigation.evidence.map((item, index) => (

            <div
              className={`evidence-card ${item.severity}`}
              key={index}
            >

              <div className="evidence-top">

                <span>
                  {item.type}
                </span>

                <i></i>

              </div>

              <strong>
                {item.title}
              </strong>

              <b>
                {item.value}
              </b>

              <p>
                {item.detail}
              </p>

            </div>

          ))}

        </div>

      </section>


      {/* NEXT STEPS */}

      <section className="panel next-investigation">

        <div className="panel-header">

          <div>

            <span className="panel-kicker">
              DECISION SUPPORT
            </span>

            <h3>
              What should happen next?
            </h3>

          </div>

        </div>


        <div className="next-step-grid">

          <NextStep
            number="01"
            title="Quantify Impact"
            text="Estimate scrap, rework and economic impact associated with the identified quality issue."
          />

          <NextStep
            number="02"
            title="Run Simulation"
            text="Test possible process changes and evaluate their effect on throughput and quality."
          />

          <NextStep
            number="03"
            title="Research Solutions"
            text="Search technical evidence and existing industrial approaches for similar problems."
          />

          <NextStep
            number="04"
            title="Human Review"
            text="Present evidence and options to an engineer before any production decision."
            active
          />

        </div>

      </section>

    </div>
  );
}


function NextStep({
  number,
  title,
  text,
  active = false,
}) {
  return (
    <div
      className={`next-step ${
        active ? "active" : ""
      }`}
    >

      <span>
        {number}
      </span>

      <div>

        <strong>
          {title}
        </strong>

        <p>
          {text}
        </p>

      </div>

      <b>
        →
      </b>

    </div>
  );
}


export default RootCauseAnalysis;