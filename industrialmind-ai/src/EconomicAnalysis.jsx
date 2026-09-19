import { useState } from "react";

const economicData = {
  "B-204": {
    product: "Precision Component A",
    affectedUnits: 72,
    totalUnits: 1250,
    totalLoss: 18400,
    scrapCost: 6200,
    reworkCost: 4100,
    downtimeCost: 5300,
    throughputLoss: 2800,
    recoveryPotential: 11600,
    lossRate: "4.2%",
  },

  "B-203": {
    product: "Precision Component A",
    affectedUnits: 32,
    totalUnits: 1180,
    totalLoss: 9200,
    scrapCost: 2800,
    reworkCost: 2300,
    downtimeCost: 2500,
    throughputLoss: 1600,
    recoveryPotential: 6100,
    lossRate: "2.1%",
  },

  "B-202": {
    product: "Precision Component B",
    affectedUnits: 31,
    totalUnits: 1320,
    totalLoss: 7100,
    scrapCost: 2100,
    reworkCost: 1700,
    downtimeCost: 1900,
    throughputLoss: 1400,
    recoveryPotential: 4800,
    lossRate: "1.8%",
  },
};

function formatCurrency(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function EconomicAnalysis() {
  const [selectedBatch, setSelectedBatch] =
    useState("B-204");

  const [scenarioReduction, setScenarioReduction] =
    useState(25);

  const data = economicData[selectedBatch];

  const projectedSaving =
    Math.round(
      data.totalLoss * (scenarioReduction / 100)
    );

  const remainingLoss =
    data.totalLoss - projectedSaving;

  return (
    <div className="economic-page">

      {/* HEADER */}

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            <span className="live-dot"></span>
            ECONOMIC INTELLIGENCE
          </div>

          <h2>
            Economic Analysis
          </h2>

          <p>
            Quantify the financial impact of quality
            and production issues across the factory.
          </p>

        </div>

        <div className="batch-selector">

          <span>ANALYZE BATCH</span>

          <select
            value={selectedBatch}
            onChange={(event) =>
              setSelectedBatch(event.target.value)
            }
          >

            {Object.keys(economicData).map(
              (batch) => (
                <option
                  key={batch}
                  value={batch}
                >
                  {batch}
                </option>
              )
            )}

          </select>

        </div>

      </div>


      {/* TOP METRICS */}

      <div className="economic-metrics">

        <div className="economic-card main-loss">

          <div className="economic-card-top">

            <span className="metric-icon">
              ₹
            </span>

            <span className="metric-label">
              ESTIMATED LOSS
            </span>

          </div>

          <strong>
            {formatCurrency(data.totalLoss)}
          </strong>

          <small>
            Current estimated economic impact
          </small>

        </div>


        <div className="economic-card">

          <div className="economic-card-top">

            <span className="metric-icon">
              #
            </span>

            <span className="metric-label">
              AFFECTED UNITS
            </span>

          </div>

          <strong>
            {data.affectedUnits}
          </strong>

          <small>
            of {data.totalUnits.toLocaleString("en-IN")}
            {" "}total units
          </small>

        </div>


        <div className="economic-card">

          <div className="economic-card-top">

            <span className="metric-icon">
              %
            </span>

            <span className="metric-label">
              LOSS RATE
            </span>

          </div>

          <strong>
            {data.lossRate}
          </strong>

          <small>
            Estimated production impact
          </small>

        </div>


        <div className="economic-card recovery-card">

          <div className="economic-card-top">

            <span className="metric-icon">
              ↗
            </span>

            <span className="metric-label">
              RECOVERY POTENTIAL
            </span>

          </div>

          <strong>
            {formatCurrency(
              data.recoveryPotential
            )}
          </strong>

          <small>
            Potentially recoverable impact
          </small>

        </div>

      </div>


      {/* LOSS BREAKDOWN */}

      <div className="economic-grid">

        <section className="panel loss-breakdown">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                ECONOMIC IMPACT
              </span>

              <h3>
                Loss Breakdown
              </h3>

            </div>

            <span className="trace-badge">
              {selectedBatch}
            </span>

          </div>


          <div className="loss-list">

            <LossRow
              label="Scrap Cost"
              value={data.scrapCost}
              total={data.totalLoss}
              icon="S"
            />

            <LossRow
              label="Rework Cost"
              value={data.reworkCost}
              total={data.totalLoss}
              icon="R"
            />

            <LossRow
              label="Downtime Cost"
              value={data.downtimeCost}
              total={data.totalLoss}
              icon="D"
            />

            <LossRow
              label="Throughput Loss"
              value={data.throughputLoss}
              total={data.totalLoss}
              icon="T"
            />

          </div>


          <div className="loss-total">

            <span>
              TOTAL ESTIMATED IMPACT
            </span>

            <strong>
              {formatCurrency(data.totalLoss)}
            </strong>

          </div>

        </section>


        {/* IMPACT SUMMARY */}

        <section className="panel impact-summary">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                BUSINESS IMPACT
              </span>

              <h3>
                Where value is being lost
              </h3>

            </div>

          </div>


          <div className="impact-visual">

            <div
              className="impact-ring"
              style={{
                background: `conic-gradient(
                  #35d89a 0% 34%,
                  #1f8e69 34% 56%,
                  #14533f 56% 85%,
                  #0d3328 85% 100%
                )`,
              }}
            >

              <div>
                <strong>
                  {formatCurrency(data.totalLoss)}
                </strong>

                <span>
                  TOTAL
                </span>
              </div>

            </div>


            <div className="impact-legend">

              <Legend
                label="Scrap"
                value={data.scrapCost}
                percentage={Math.round(
                  (data.scrapCost /
                    data.totalLoss) *
                    100
                )}
              />

              <Legend
                label="Rework"
                value={data.reworkCost}
                percentage={Math.round(
                  (data.reworkCost /
                    data.totalLoss) *
                    100
                )}
              />

              <Legend
                label="Downtime"
                value={data.downtimeCost}
                percentage={Math.round(
                  (data.downtimeCost /
                    data.totalLoss) *
                    100
                )}
              />

              <Legend
                label="Throughput"
                value={data.throughputLoss}
                percentage={Math.round(
                  (data.throughputLoss /
                    data.totalLoss) *
                    100
                )}
              />

            </div>

          </div>

        </section>

      </div>


      {/* WHAT-IF SIMULATION */}

      <section className="panel scenario-panel">

        <div className="panel-header">

          <div>

            <span className="panel-kicker">
              WHAT-IF SCENARIO
            </span>

            <h3>
              Potential Financial Recovery
            </h3>

          </div>

          <span className="scenario-badge">
            SIMULATION
          </span>

        </div>


        <p className="scenario-description">
          Adjust the expected reduction in the current
          economic impact to explore a simple recovery
          scenario.
        </p>


        <div className="scenario-content">

          <div className="scenario-slider-area">

            <div className="scenario-values">

              <span>
                EXPECTED IMPACT REDUCTION
              </span>

              <strong>
                {scenarioReduction}%
              </strong>

            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={scenarioReduction}
              onChange={(event) =>
                setScenarioReduction(
                  Number(event.target.value)
                )
              }
            />

            <div className="slider-labels">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

          </div>


          <div className="scenario-result">

            <div>

              <span>
                PROJECTED SAVING
              </span>

              <strong>
                {formatCurrency(projectedSaving)}
              </strong>

            </div>

            <div>

              <span>
                REMAINING IMPACT
              </span>

              <strong>
                {formatCurrency(remainingLoss)}
              </strong>

            </div>

          </div>

        </div>

      </section>


      {/* DECISION SUPPORT */}

      <section className="panel decision-panel">

        <div className="decision-icon">
          ₹
        </div>

        <div className="decision-content">

          <span className="panel-kicker">
            AI DECISION SUPPORT
          </span>

          <h3>
            Economic impact should be considered
            alongside quality and process evidence.
          </h3>

          <p>
            The estimated loss provides a financial
            context for evaluating possible corrective
            actions. Final implementation decisions
            remain with the responsible engineer.
          </p>

        </div>

        <button className="configure-button">
          Configure Analysis →
        </button>

      </section>

    </div>
  );
}


/* LOSS ROW */

function LossRow({
  label,
  value,
  total,
  icon,
}) {
  const percentage = Math.round(
    (value / total) * 100
  );

  return (
    <div className="loss-row">

      <div className="loss-icon">
        {icon}
      </div>

      <div className="loss-info">

        <div className="loss-title">

          <strong>
            {label}
          </strong>

          <span>
            {percentage}%
          </span>

        </div>

        <div className="loss-bar">

          <div
            style={{
              width: `${percentage}%`,
            }}
          />

        </div>

      </div>

      <strong className="loss-value">
        {formatCurrency(value)}
      </strong>

    </div>
  );
}


/* LEGEND */

function Legend({
  label,
  value,
  percentage,
}) {
  return (
    <div className="legend-row">

      <div className="legend-label">

        <span></span>

        <strong>
          {label}
        </strong>

      </div>

      <div>

        <strong>
          {formatCurrency(value)}
        </strong>

        <small>
          {percentage}%
        </small>

      </div>

    </div>
  );
}


export default EconomicAnalysis;