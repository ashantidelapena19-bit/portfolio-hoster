import React from 'react';
import { ArrowUpRight, FolderCode } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { CLASS_TECH_STACK, StudentPortfolio } from '../data/portfolios';
import { useAntigravityScroll } from './AntigravityScrollProvider';
import { SocialLinksBar } from './SocialLinksBar';

interface SkillsAndContributorsProps {
  portfolios: StudentPortfolio[];
  selectedSkill: string | null;
  onSelectSkill: (skill: string | null) => void;
  onSelectPortfolio: (item: StudentPortfolio) => void;
}

const ANTIGRAVITY_EASE = [0.22, 1, 0.36, 1] as const;

export const SkillsAndContributors: React.FC<SkillsAndContributorsProps> = ({
  portfolios,
  selectedSkill,
  onSelectSkill,
  onSelectPortfolio,
}) => {
  const { scrollTo } = useAntigravityScroll();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {/* Technical Stack Filter Matrix */}
      <section
        id="tech-stack"
        className="border-t border-[var(--p-border)] bg-[var(--p-surface-subtle)] py-16 transition-colors duration-200"
      >
        <div className="max-w-[1360px] mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: ANTIGRAVITY_EASE }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
          >
            <div>
              <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight text-[var(--p-ink)]">
                Class A Technical Stack
              </h2>
              <p className="text-[15px] text-[var(--p-muted)] mt-1.5 max-w-2xl">
                Select any core technology below to filter the portfolio gallery by student skill proficiency.
              </p>
            </div>
            {selectedSkill && (
              <button
                type="button"
                onClick={() => onSelectSkill(null)}
                className="self-start md:self-auto px-4 py-2 rounded-lg border border-[var(--p-border)] bg-[var(--p-surface-elevated)] text-[13px] font-medium text-[var(--p-ink)] hover:bg-[var(--p-surface)] transition-colors cursor-pointer"
              >
                Reset Skill Filter
              </button>
            )}
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CLASS_TECH_STACK.map((tech, idx) => {
              const isActive = selectedSkill === tech.name;
              return (
                <motion.button
                  key={tech.name}
                  type="button"
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.55,
                    delay: (idx % 5) * 0.045,
                    ease: ANTIGRAVITY_EASE,
                  }}
                  whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                  onClick={() => {
                    onSelectSkill(isActive ? null : tech.name);
                    scrollTo('#gallery', { offset: -84, duration: 1.15 });
                  }}
                  className={`text-left p-4 rounded-xl border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--p-accent)] ${
                    isActive
                      ? 'bg-[var(--p-action)] text-[var(--p-action-ink)] border-[var(--p-action)]'
                      : 'bg-[var(--p-surface-elevated)] text-[var(--p-ink)] border-[var(--p-border)] hover:border-[var(--p-border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[14px] truncate">{tech.name}</span>
                    <span
                      className={`text-[12px] font-[family-name:var(--font-mono)] tabular-nums ${
                        isActive ? 'opacity-75' : 'text-[var(--p-muted)]'
                      }`}
                    >
                      {tech.count}
                    </span>
                  </div>
                  <div
                    className={`text-[12px] mt-1 ${
                      isActive ? 'opacity-70' : 'text-[var(--p-muted)]'
                    }`}
                  >
                    {tech.category}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3-Column Student Contributor Directory */}
      <section
        id="contributors"
        className="border-t border-[var(--p-border)] bg-[var(--p-bg)] py-16 transition-colors duration-200"
      >
        <div className="max-w-[1360px] mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: ANTIGRAVITY_EASE }}
            className="mb-10"
          >
            <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight text-[var(--p-ink)]">
              Individual Contributors & Portfolio Sites
            </h2>
            <p className="text-[15px] text-[var(--p-muted)] mt-1.5 max-w-2xl">
              Every Software Engineering Class A student authors and maintains an independent portfolio site inside the cohort directory.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{
                  duration: 0.65,
                  delay: (idx % 3) * 0.07,
                  ease: ANTIGRAVITY_EASE,
                }}
                className="p-6 rounded-xl border border-[var(--p-border)] bg-[var(--p-surface-elevated)] hover:border-[var(--p-border-strong)] transition-colors flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center text-base font-bold text-white shrink-0 select-none"
                      style={{ backgroundColor: student.avatarColor }}
                    >
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.studentName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        student.initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[16px] font-bold text-[var(--p-ink)] truncate">
                        {student.studentName}
                      </h3>
                      <p className="text-[13px] text-[var(--p-muted)] truncate">
                        {student.username ? `@${student.username}` : student.rollNumber} ·{' '}
                        {student.roleTitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-[14px] text-[var(--p-ink-secondary)] mt-4 leading-relaxed">
                    {student.projectSummary}
                  </p>

                  {student.socialLinks && (
                    <div className="mt-3.5">
                      <SocialLinksBar links={student.socialLinks} size="sm" />
                    </div>
                  )}

                  <div className="mt-3 text-[12px] text-[var(--p-muted)]">
                    {student.highlights.join(' · ')}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--p-border)] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectPortfolio(student)}
                    className="text-[13px] font-semibold text-[var(--p-ink)] hover:text-[var(--p-accent)] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {student.portfolioUrl ? 'Preview Site' : 'View Portfolio'}
                  </button>
                  {student.portfolioUrl ? (
                    <a
                      href={student.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--p-muted)] hover:text-[var(--p-ink)] transition-colors whitespace-nowrap"
                    >
                      <span>
                        {student.isPublishedCommunity ? 'Open Site' : 'Open index.html'}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[12px] text-[var(--p-muted)]">
                      Published Showcase
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nested Architecture / Site Map Section */}
      <section
        id="structure"
        className="border-t border-[var(--p-border)] bg-[var(--p-surface-subtle)] py-14 transition-colors duration-200"
      >
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.68, ease: ANTIGRAVITY_EASE }}
          className="max-w-[1360px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <div className="lg:col-span-5">
            <h2 className="text-[22px] font-bold tracking-tight text-[var(--p-ink)]">
              Nested Portfolio Architecture
            </h2>
            <p className="text-[14px] text-[var(--p-muted)] mt-2 leading-relaxed">
              The root gallery showcases every student’s work in a unified Dribbble-style grid while linking directly to each contributor’s standalone HTML site under{' '}
              <code className="font-[family-name:var(--font-mono)] text-[var(--p-ink)]">student-portfolios/</code>.
            </p>
          </div>

          <div className="lg:col-span-7 bg-[var(--p-surface-elevated)] border border-[var(--p-border)] rounded-xl p-5 font-[family-name:var(--font-mono)] text-[12px] text-[var(--p-ink-secondary)] space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-[var(--p-ink)]">
              <FolderCode className="w-4 h-4 text-[var(--p-accent)]" />
              <span>index.html (Class A Gallery Hub)</span>
            </div>
            <div className="pl-6 text-[var(--p-muted)]">student-portfolios/</div>
            <div className="pl-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {portfolios
                .filter((p) => !p.isPublishedCommunity)
                .map((p) => (
                  <a
                    key={p.id}
                    href={p.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--p-accent)] transition-colors truncate"
                  >
                    {p.folderName}/index.html
                  </a>
                ))}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};
