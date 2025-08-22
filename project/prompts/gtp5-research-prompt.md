<request>
Critically review and improve the project’s scope and solution design using the attached artifacts:
- scope.md
- design.md
- tasks.md

Primary goals:
1) Deliver research-backed, insightful feedback on the current plan and design.
2) Propose concrete, prioritized recommendations that improve the solution architecture and overall project success.
3) Provide copy-pastable improvements to the scope itself.

Allocate deliberate time for deeper thinking:
- Phase A: Research (~5 minutes)
- Phase B: Reflection & self-critique (~5 minutes)
- Phase C: Confidence-building & verification (~5 minutes)

Note: Keep detailed internal reasoning private. Output only succinct summaries, conclusions, evidence, and actionable recommendations.
</request>

<inputs>
- Business context: [goals, KPIs, key users, constraints]
- Target stack & environment (if known): [backend, frontend, data, infra]
- Non-functional requirements: [performance, scalability, security, privacy, compliance, availability, observability]
- Constraints/assumptions/dependencies: [list any]
</inputs>

<phases>
  <phase_a name="Research (~5m)">
    - Identify relevant best practices for: scope clarity, product/UX alignment, architectural patterns, data modeling, integrations/APIs, security/privacy/compliance, performance/scalability, testing & quality, observability, CI/CD, rollout/migration, cost.
    - If browsing/tools are available, consult authoritative sources and cite them. If not available, clearly label guidance as “internal best-practice inference.”
    - Extract success patterns and common pitfalls applicable to the artifacts.
  </phase_a>

  <phase_b name="Reflection (~5m)">
    - Cross-examine your initial findings; look for contradictions or missing angles.
    - Consider alternative architectural approaches and trade-offs.
    - Keep the self-critique internal; output only a brief “Reflections Summary” (bullets).
  </phase_b>

  <phase_c name="Confidence-building (~5m)">
    - Validate recommendations against inputs and non-functional requirements.
    - Perform a consistency and feasibility check across scope, design, and tasks.
    - Assign a Confidence rating (e.g., High/Med/Low) for each key recommendation with a one-line justification.
  </phase_c>
</phases>

<instructions>
1) High-level synthesis
   - Summarize the project (goals, stakeholders, deliverables, milestones) from scope.md.
   - Extract the intended solution from design.md (architecture, data model, integrations, NFRs).
   - Map tasks from tasks.md to scope deliverables and design components; flag misalignments.

2) Gap & risk analysis (design-first)
   - Architecture: modularity, cohesion/coupling, boundaries, scalability paths, failure modes, cost awareness.
   - Data & APIs: schema soundness, versioning, idempotency, pagination, consistency, privacy.
   - Security & compliance: authn/z, secrets, data protection, auditing, regulatory fit.
   - Performance & reliability: SLIs/SLOs, caching, backpressure, timeouts/retries, resiliency patterns.
   - Observability & quality: logs/metrics/traces, dashboards, alerting, test pyramid, CI/CD.
   - Delivery plan: critical path, milestones, rollout/migrations, change management, fallback/rollback.

3) Design-focused recommendations (actionable & prioritized)
   - For each recommendation provide: Rationale, Expected Impact, Effort, Risks/Trade-offs, Evidence (source or principle).
   - Where relevant, propose 2–3 viable design alternatives with pros/cons and “when to choose.”

4) Scope improvements (copy-pastable)
   - Redraft key scope sections: Goals, Out of Scope, Success Metrics, NFRs, Architecture Overview, Milestones, Acceptance Criteria.

5) Verification & confidence
   - Run a checklist across clarity, alignment, feasibility, risk mitigation, measurable outcomes, and NFR coverage.
   - Output a Confidence rating per recommendation with a one-line justification.

6) Output only the results (no step-by-step internal reasoning).
</instructions>

<constraints>
- Style: formal, evidence-oriented, solution-focused, constructive.
- Verbosity: high for analysis/recommendations; concise for executive summary.
- Output format: Markdown with clear headings and tables; include brief citations if browsing was used.
- Safety: do not include secrets; flag any compliance or security gaps explicitly.
</constraints>

<task_spec>
  Definition: Produce a research-backed critique of scope.md/design.md/tasks.md, propose design-centric improvements, and supply updated scope text.
  When Required: Whenever the three artifacts are provided or updated.
  Format & Style: Structured Markdown report.
  Sequence: Synthesis → Gap/Risk → Recommendations → Redrafted Scope → Verification/Confidence.
  Prohibited: Vague, generic advice; uncited non-obvious claims; exposing chain-of-thought.
  Handling Ambiguity: Proceed with clearly labeled assumptions and decision points for stakeholder validation.
</task_spec>
