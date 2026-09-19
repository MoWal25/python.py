import { useState } from "react";
import "./App.css";
import BatchTraceability from "./BatchTraceability";
import RootCauseAnalysis from "./RootCauseAnalysis";
import EconomicAnalysis from "./EconomicAnalysis";

const features = [
  {
    id: "quality",
    name: "Quality Agent",
    icon: "◈",
    description:
      "Inspect products, detect defects and assess quality.",
  },
  {
    id: "image-inspection",
    name: "Image Inspection",
    icon: "▣",
    description:
      "Upload product images for AI-powered visual inspection.",
  },
  {
    id: "production",
    name: "Production Agent",
    icon: "⚙",
    description:
      "Monitor production, throughput and bottlenecks.",
  },
  {
    id: "environment",
    name: "Environment Agent",
    icon: "◌",
    description:
      "Analyze factory environmental conditions.",
  },
  {
    id: "rootcause",
    name: "Root Cause Analysis",
    icon: "⌁",
    description:
      "Connect quality problems with possible contributing factors.",
  },
  {
    id: "economic",
    name: "Economic Analysis",
    icon: "₹",
    description:
      "Understand cost, losses and economic impact.",
  },
  {
    id: "simulation",
    name: "Production Simulation",
    icon: "◫",
    description:
      "Test what-if production scenarios.",
  },
  {
    id: "research",
    name: "Solution Research",
    icon: "⌕",
    description:
      "Research industrial solutions and technical evidence.",
  },
  {
    id: "recommendations",
    name: "Recommendations",
    icon: "✦",
    description:
      "Review AI-generated decision-support recommendations.",
  },
  {
    id: "traceability",
    name: "Batch Traceability",
    icon: "⛓",
    description:
      "Trace products through batches, stations and processes.",
  },
  {
    id: "delivery",
    name: "Delivery Analysis",
    icon: "◇",
    description:
      "Compare product condition before and after delivery.",
  },
  {
    id: "knowledge",
    name: "Knowledge Base",
    icon: "▤",
    description:
      "Access previous problems, decisions and outcomes.",
  },
  {
    id: "learning",
    name: "Learning & Feedback",
    icon: "↻",
    description:
      "Capture engineer decisions and observed outcomes.",
  },
];

const dashboardStats = [
  {
    title: "Quality Score",
    value: "94.2%",
    change: "+2.4%",
    type: "positive",
    icon: "◈",
  },
  {
    title: "Production Efficiency",
    value: "87.6%",
    change: "+4.1%",
    type: "positive",
    icon: "⚙",
  },
  {
    title: "Active Issues",
    value: "07",
    change: "-3 today",
    type: "positive",
    icon: "!",
  },
  {
    title: "Estimated Loss",
    value: "₹18.4K",
    change: "This week",
    type: "neutral",
    icon: "₹",
  },
];

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Shared image state
  const [images, setImages] = useState([]);

  // Whether the uploaded images have been "analyzed"
  const [analyzed, setAnalyzed] = useState(false);

  const activeFeature = features.find(
    (feature) => feature.id === activePage
  );

  const navigate = (page) => {
    setActivePage(page);
  };

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside
        className={`sidebar ${
          sidebarOpen ? "open" : "closed"
        }`}
      >
        <div className="brand">
          <div className="brand-mark">IM</div>

          {sidebarOpen && (
            <div className="brand-text">
              <h1>IndustrialMind</h1>
              <span>AI DECISION SYSTEM</span>
            </div>
          )}
        </div>

        <div className="sidebar-section">

          {sidebarOpen && (
            <p className="section-label">
              WORKSPACE
            </p>
          )}

          <button
            className={`nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() => navigate("dashboard")}
          >
            <span className="nav-icon">⌂</span>
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          {sidebarOpen && (
            <p className="section-label feature-label">
              AI AGENTS
            </p>
          )}

          {features.slice(0, 4).map((feature) => (
            <button
              key={feature.id}
              className={`nav-item ${
                activePage === feature.id
                  ? "active"
                  : ""
              }`}
              onClick={() => navigate(feature.id)}
            >
              <span className="nav-icon">
                {feature.icon}
              </span>

              {sidebarOpen && (
                <span>{feature.name}</span>
              )}
            </button>
          ))}

          {sidebarOpen && (
            <p className="section-label feature-label">
              ANALYSIS
            </p>
          )}

          {features.slice(4, 8).map((feature) => (
            <button
              key={feature.id}
              className={`nav-item ${
                activePage === feature.id
                  ? "active"
                  : ""
              }`}
              onClick={() => navigate(feature.id)}
            >
              <span className="nav-icon">
                {feature.icon}
              </span>

              {sidebarOpen && (
                <span>{feature.name}</span>
              )}
            </button>
          ))}

          {sidebarOpen && (
            <p className="section-label feature-label">
              INTELLIGENCE
            </p>
          )}

          {features.slice(8).map((feature) => (
            <button
              key={feature.id}
              className={`nav-item ${
                activePage === feature.id
                  ? "active"
                  : ""
              }`}
              onClick={() => navigate(feature.id)}
            >
              <span className="nav-icon">
                {feature.icon}
              </span>

              {sidebarOpen && (
                <span>{feature.name}</span>
              )}
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot"></span>

            {sidebarOpen && (
              <div>
                <strong>System Online</strong>
                <small>Backend ready</small>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main
        className={`main-area ${
          sidebarOpen ? "" : "expanded"
        }`}
      >

        {/* TOP BAR */}
        <header className="topbar">

          <button
            className="menu-button"
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
          >
            ☰
          </button>

          <div className="breadcrumb">
            <span>IndustrialMind AI</span>
            <b>/</b>

            <strong>
              {activePage === "dashboard"
                ? "Dashboard"
                : activeFeature?.name}
            </strong>
          </div>

          <div className="topbar-right">

            <div className="factory-selector">
              <span className="factory-dot"></span>
              <span>Factory Alpha</span>
              <span className="arrow">⌄</span>
            </div>

            <button className="notification-button">
              ◔
              <span className="notification-badge">
                3
              </span>
            </button>

            <div className="user-avatar">
              E
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="content">

          {activePage === "dashboard" && (
            <Dashboard
              onNavigate={navigate}
            />
          )}

          {activePage === "image-inspection" && (
            <ImageInspection
              images={images}
              setImages={setImages}
              onAnalyze={() => {
                setAnalyzed(true);
                navigate("quality");
              }}
            />
          )}

          {activePage === "quality" && (
            <QualityAgent
              images={images}
              analyzed={analyzed}
              onGoToUpload={() =>
                navigate("image-inspection")
              }
            />
          )}

   {activePage === "quality" && (
  <QualityAgent
    images={images}
    analyzed={analyzed}
    onGoToUpload={() =>
      navigate("image-inspection")
    }
  />
)}

{activePage === "traceability" && (
  <BatchTraceability />
)}

{activePage === "rootcause" && (
  <RootCauseAnalysis />
)}

{activePage === "economic" && (
  <EconomicAnalysis />
)}

{activePage !== "dashboard" &&
  activePage !== "image-inspection" &&
  activePage !== "quality" &&
  activePage !== "traceability" &&
  activePage !== "rootcause" &&
  activePage !== "economic" && (
    <FeaturePage
      feature={activeFeature}
    />
  )}

        </div>
      </main>
    </div>
  );
}


/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard({ onNavigate }) {
  return (
    <>
      <div className="page-heading">

        <div>
          <div className="eyebrow">
            <span className="live-dot"></span>
            LIVE FACTORY INTELLIGENCE
          </div>

          <h2>
            Good afternoon, Engineer.
          </h2>

          <p>
            Here's the current operational picture
            of Factory Alpha.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            onNavigate("recommendations")
          }
        >
          ✦ View AI Recommendations
        </button>
      </div>


      <div className="stats-grid">

        {dashboardStats.map((stat) => (
          <div
            className="stat-card"
            key={stat.title}
          >
            <div className="stat-top">

              <div className="stat-icon">
                {stat.icon}
              </div>

              <span
                className={`change ${stat.type}`}
              >
                {stat.change}
              </span>

            </div>

            <p>{stat.title}</p>
            <h3>{stat.value}</h3>
          </div>
        ))}

      </div>


      <div className="dashboard-grid">

        <section className="panel factory-health">

          <div className="panel-header">
            <div>
              <span className="panel-kicker">
                OVERVIEW
              </span>

              <h3>Factory Health</h3>
            </div>

            <button className="ghost-button">
              Today ⌄
            </button>
          </div>

          <div className="health-score">

            <div className="score-ring">
              <div>
                <strong>91</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="health-details">

              <HealthItem
                title="Quality"
                value="94.2% pass rate"
                good
              />

              <HealthItem
                title="Production"
                value="87.6% efficiency"
                good
              />

              <HealthItem
                title="Environment"
                value="2 unusual readings"
              />

            </div>
          </div>
        </section>


        <section className="panel alerts-panel">

          <div className="panel-header">
            <div>
              <span className="panel-kicker">
                ATTENTION
              </span>

              <h3>Active Alerts</h3>
            </div>

            <span className="alert-count">
              3 active
            </span>
          </div>

          <div className="alert-list">

            <Alert
              level="high"
              title="Defect rate increased"
              description="Batch B-204 shows abnormal defect frequency."
              time="12 min ago"
            />

            <Alert
              level="medium"
              title="Temperature anomaly"
              description="Station 04 exceeded normal range."
              time="31 min ago"
            />

            <Alert
              level="low"
              title="Throughput variation"
              description="Line 02 is operating below expected capacity."
              time="1 hr ago"
            />

          </div>
        </section>
      </div>


      <div className="dashboard-grid second-row">

        <section className="panel production-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                PRODUCTION AGENT
              </span>

              <h3>
                Production Performance
              </h3>
            </div>

            <button className="ghost-button">
              Last 7 days ⌄
            </button>

          </div>

          <div className="chart-area">

            <div className="chart-y-axis">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            <div className="fake-chart">

              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>

              <div className="chart-bars">

                {[68, 74, 63, 82, 77, 88, 86].map(
                  (height, index) => (

                    <div
                      className="bar-column"
                      key={index}
                    >
                      <div
                        className="bar"
                        style={{
                          height: `${height}%`,
                        }}
                      ></div>

                      <span>
                        {
                          [
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                            "Sun",
                          ][index]
                        }
                      </span>
                    </div>

                  )
                )}

              </div>
            </div>
          </div>
        </section>


        <section className="panel insight-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                AI INSIGHT
              </span>

              <h3>
                What the system found
              </h3>
            </div>

            <span className="ai-badge">
              AI
            </span>
          </div>

          <div className="insight-content">

            <div className="insight-icon">
              ✦
            </div>

            <h4>
              Batch B-204 requires investigation
            </h4>

            <p>
              The system detected an unusual increase
              in defects compared with historical batches.
            </p>

            <div className="insight-tags">
              <span>Quality anomaly</span>
              <span>Batch B-204</span>
              <span>High priority</span>
            </div>

            <button
              className="outline-button"
              onClick={() =>
                onNavigate("rootcause")
              }
            >
              Investigate Root Cause →
            </button>
          </div>
        </section>
      </div>


      <section className="workflow-panel">

        <div className="panel-header">
          <div>
            <span className="panel-kicker">
              DECISION LOOP
            </span>

            <h3>
              IndustrialMind Workflow
            </h3>
          </div>
        </div>

        <div className="workflow">

          {[
            "Detect",
            "Understand",
            "Quantify",
            "Simulate",
            "Recommend",
            "Learn",
          ].map((item, index) => (
            <div
              className="workflow-container"
              key={item}
            >
              <WorkflowStep
                number={`0${index + 1}`}
                title={item}
              />

              {index < 5 && (
                <div className="workflow-arrow">
                  →
                </div>
              )}
            </div>
          ))}

        </div>
      </section>
    </>
  );
}


/* =====================================================
   IMAGE INSPECTION
===================================================== */

function ImageInspection({
  images,
  setImages,
  onAnalyze,
}) {
  const [dragActive, setDragActive] =
    useState(false);

  const addImages = (fileList) => {

    const selectedFiles =
      Array.from(fileList);

    const imageFiles =
      selectedFiles.filter((file) =>
        file.type.startsWith("image/")
      );

    const newImages =
      imageFiles.map((file) => ({
        id:
          `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        preview:
          URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));

    setImages((previous) => [
      ...previous,
      ...newImages,
    ]);
  };


  const removeImage = (id) => {

    setImages((previous) => {

      const image =
        previous.find(
          (item) => item.id === id
        );

      if (image) {
        URL.revokeObjectURL(
          image.preview
        );
      }

      return previous.filter(
        (item) => item.id !== id
      );
    });
  };


  const clearImages = () => {

    images.forEach((image) => {
      URL.revokeObjectURL(
        image.preview
      );
    });

    setImages([]);
  };


  const handleDrop = (event) => {

    event.preventDefault();
    setDragActive(false);

    addImages(
      event.dataTransfer.files
    );
  };


  return (
    <div className="image-inspection-page">

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            <span className="live-dot"></span>
            QUALITY INTELLIGENCE
          </div>

          <h2>
            Image Inspection
          </h2>

          <p>
            Upload product images for visual
            quality analysis and defect detection.
          </p>

        </div>

        <div className="module-status">
          <span className="status-dot"></span>
          Ready for AI analysis
        </div>

      </div>


      <section className="panel upload-panel">

        <div className="panel-header">

          <div>
            <span className="panel-kicker">
              IMAGE INPUT
            </span>

            <h3>
              Upload inspection images
            </h3>
          </div>

          <span className="image-counter">
            {images.length} image
            {images.length !== 1
              ? "s"
              : ""}
          </span>

        </div>


        <div
          className={`upload-zone ${
            dragActive
              ? "drag-active"
              : ""
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() =>
            setDragActive(false)
          }
          onDrop={handleDrop}
        >

          <div className="upload-icon">
            ↑
          </div>

          <h3>
            Drop your images here
          </h3>

          <p>
            Drag and drop product images here,
            or choose files from your computer.
          </p>

          <label className="upload-button">

            <span>＋</span>
            Choose Images

            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) =>
                addImages(
                  event.target.files
                )
              }
            />

          </label>

          <small>
            PNG, JPG, JPEG, WEBP and other
            browser-supported image formats
          </small>

        </div>
      </section>


      {images.length > 0 && (

        <section className="panel uploaded-images-panel">

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                UPLOADED DATA
              </span>

              <h3>
                Inspection Images
              </h3>
            </div>

            <button
              className="clear-button"
              onClick={clearImages}
            >
              Clear all
            </button>

          </div>


          <div className="image-grid">

            {images.map((image) => (

              <div
                className="image-card"
                key={image.id}
              >

                <div className="image-preview">

                  <img
                    src={image.preview}
                    alt={image.name}
                  />

                  <button
                    className="remove-image"
                    onClick={() =>
                      removeImage(
                        image.id
                      )
                    }
                  >
                    ×
                  </button>

                </div>

                <div className="image-info">

                  <strong title={image.name}>
                    {image.name}
                  </strong>

                  <span>
                    {(
                      image.size /
                      1024 /
                      1024
                    ).toFixed(2)} MB
                  </span>

                </div>

              </div>
            ))}
          </div>


          <div className="analysis-bar">

            <div>
              <strong>
                {images.length} image
                {images.length !== 1
                  ? "s"
                  : ""} ready
              </strong>

              <span>
                Ready for Quality Agent inspection.
              </span>
            </div>

            <button
              className="primary-button"
              onClick={onAnalyze}
            >
              ✦ Analyze Images
            </button>

          </div>
        </section>
      )}


      {images.length === 0 && (
        <div className="inspection-info-grid">

          <InfoCard
            number="01"
            title="Upload"
            text="Add one or multiple product images for inspection."
          />

          <InfoCard
            number="02"
            title="Analyze"
            text="The Quality Agent evaluates the uploaded images."
          />

          <InfoCard
            number="03"
            title="Understand"
            text="Inspection results can feed root cause and recommendation modules."
          />

        </div>
      )}

    </div>
  );
}


/* =====================================================
   QUALITY AGENT
===================================================== */

function QualityAgent({
  images,
  analyzed,
  onGoToUpload,
}) {
  return (
    <div className="quality-agent-page">

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            <span className="live-dot"></span>
            AI QUALITY AGENT
          </div>

          <h2>
            Quality Inspection
          </h2>

          <p>
            AI-assisted visual assessment of
            uploaded product images.
          </p>

        </div>

        <div className="module-status">
          <span className="status-dot"></span>
          {analyzed
            ? "Inspection complete"
            : "Waiting for images"}
        </div>

      </div>


      {images.length === 0 ? (

        <section className="panel empty-quality">

          <div className="large-feature-icon">
            ◈
          </div>

          <h3>
            No inspection images
          </h3>

          <p>
            Upload product images first to
            begin a quality inspection.
          </p>

          <button
            className="primary-button"
            onClick={onGoToUpload}
          >
            ↑ Upload Images
          </button>

        </section>

      ) : (

        <>

          {/* SUMMARY */}
          <div className="quality-summary-grid">

            <QualityMetric
              label="Inspection Status"
              value="Complete"
              sub={`${images.length} image${
                images.length !== 1
                  ? "s"
                  : ""
              } analyzed`}
              good
            />

            <QualityMetric
              label="Classification"
              value="DEFECT"
              sub="Surface anomaly detected"
            />

            <QualityMetric
              label="Confidence"
              value="94.7%"
              sub="Model confidence"
              good
            />

            <QualityMetric
              label="Severity"
              value="MEDIUM"
              sub="Requires investigation"
            />

          </div>


          {/* MAIN RESULT */}
          <div className="quality-result-grid">

            <section className="panel inspected-images">

              <div className="panel-header">

                <div>
                  <span className="panel-kicker">
                    VISUAL INPUT
                  </span>

                  <h3>
                    Inspected Images
                  </h3>
                </div>

                <span className="ai-badge">
                  AI
                </span>

              </div>


              <div className="quality-image-grid">

                {images.map((image) => (

                  <div
                    className="quality-image-card"
                    key={image.id}
                  >

                    <img
                      src={image.preview}
                      alt={image.name}
                    />

                    <div className="inspection-overlay">
                      <span>
                        INSPECTED
                      </span>
                    </div>

                  </div>

                ))}

              </div>

            </section>


            {/* AI FINDINGS */}
            <section className="panel ai-findings">

              <div className="panel-header">

                <div>
                  <span className="panel-kicker">
                    AI FINDINGS
                  </span>

                  <h3>
                    Inspection Result
                  </h3>
                </div>

              </div>


              <div className="finding-main">

                <div className="finding-status-icon">
                  !
                </div>

                <div>
                  <span>
                    PRIMARY CLASSIFICATION
                  </span>

                  <h3>
                    Surface Anomaly
                  </h3>

                  <p>
                    The inspection system detected
                    a potential surface irregularity
                    requiring further investigation.
                  </p>
                </div>

              </div>


              <div className="confidence-section">

                <div className="confidence-header">

                  <span>
                    Model confidence
                  </span>

                  <strong>
                    94.7%
                  </strong>

                </div>

                <div className="confidence-bar">
                  <div
                    style={{
                      width: "94.7%",
                    }}
                  ></div>
                </div>

              </div>


              <div className="finding-list">

                <Finding
                  label="Defect category"
                  value="Surface anomaly"
                />

                <Finding
                  label="Severity"
                  value="Medium"
                />

                <Finding
                  label="Novelty signal"
                  value="Low"
                />

                <Finding
                  label="Recommended action"
                  value="Investigate"
                />

              </div>

            </section>

          </div>


          {/* NEXT INTELLIGENCE */}
          <section className="panel next-analysis">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  NEXT INTELLIGENCE LAYER
                </span>

                <h3>
                  What should happen next?
                </h3>
              </div>

            </div>


            <div className="analysis-path">

              <AnalysisPath
                number="01"
                title="Root Cause"
                text="Look for contributing production and environmental factors."
                active
              />

              <div className="path-arrow">
                →
              </div>

              <AnalysisPath
                number="02"
                title="Economic Impact"
                text="Estimate scrap, rework and potential production loss."
              />

              <div className="path-arrow">
                →
              </div>

              <AnalysisPath
                number="03"
                title="Recommendation"
                text="Generate evidence-based options for engineer review."
              />

            </div>

          </section>


          <div className="quality-actions">

            <button
              className="outline-button"
              onClick={onGoToUpload}
            >
              ← Inspect More Images
            </button>

            <button
              className="primary-button"
              onClick={() =>
                alert(
                  "Root Cause Analysis will be connected to the backend next."
                )
              }
            >
              Investigate Root Cause →
            </button>

          </div>

        </>
      )}
    </div>
  );
}


/* =====================================================
   GENERIC FEATURE PAGE
===================================================== */

function FeaturePage({ feature }) {

  return (
    <div className="feature-page">

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            <span className="live-dot"></span>
            INDUSTRIALMIND AI MODULE
          </div>

          <h2>
            {feature.name}
          </h2>

          <p>
            {feature.description}
          </p>

        </div>

        <div className="module-status">
          <span className="status-dot"></span>
          Ready for backend
        </div>

      </div>


      <div className="feature-grid">

        <div className="feature-main panel">

          <div className="empty-module">

            <div className="large-feature-icon">
              {feature.icon}
            </div>

            <h3>
              {feature.name}
            </h3>

            <p>
              This module is ready for AI
              and backend integration.
            </p>

            <button className="primary-button">
              Configure Module
            </button>

          </div>

        </div>


        <div className="feature-side">

          <div className="panel mini-panel">

            <span className="panel-kicker">
              MODULE STATUS
            </span>

            <div className="module-stat">
              <strong>Online</strong>
              <span className="status-dot"></span>
            </div>

            <p>
              Waiting for backend data
              connection.
            </p>

          </div>


          <div className="panel mini-panel">

            <span className="panel-kicker">
              NEXT STEP
            </span>

            <h4>
              Connect API
            </h4>

            <p>
              Backend endpoints can be connected
              here later without changing the
              overall interface.
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}


/* =====================================================
   SMALL COMPONENTS
===================================================== */

function HealthItem({
  title,
  value,
  good = false,
}) {
  return (
    <div className="health-item">

      <span
        className={`health-indicator ${
          good ? "good" : "warning"
        }`}
      ></span>

      <div>
        <strong>{title}</strong>
        <small>{value}</small>
      </div>

    </div>
  );
}


function Alert({
  level,
  title,
  description,
  time,
}) {
  return (
    <div className="alert-item">

      <span
        className={`alert-indicator ${level}`}
      ></span>

      <div className="alert-text">

        <strong>{title}</strong>

        <p>{description}</p>

      </div>

      <span className="alert-time">
        {time}
      </span>

    </div>
  );
}


function WorkflowStep({
  number,
  title,
}) {
  return (
    <div className="workflow-step">
      <span>{number}</span>
      <strong>{title}</strong>
    </div>
  );
}


function InfoCard({
  number,
  title,
  text,
}) {
  return (
    <div className="panel info-card">

      <span className="info-number">
        {number}
      </span>

      <h3>{title}</h3>

      <p>{text}</p>

    </div>
  );
}


function QualityMetric({
  label,
  value,
  sub,
  good = false,
}) {
  return (
    <div className="panel quality-metric">

      <span>{label}</span>

      <strong
        className={good ? "metric-good" : ""}
      >
        {value}
      </strong>

      <small>{sub}</small>

    </div>
  );
}


function Finding({
  label,
  value,
}) {
  return (
    <div className="finding-row">

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}


function AnalysisPath({
  number,
  title,
  text,
  active = false,
}) {
  return (
    <div
      className={`analysis-path-card ${
        active ? "active" : ""
      }`}
    >

      <span>{number}</span>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

    </div>
  );
}

export default App;