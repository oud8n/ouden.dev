import { Code } from '../Code'
import { NoteLayout } from '../NoteLayout'
import { BlindFigure } from './BlindFigure'
import { CalcFigure } from './CalcFigure'
import { FallbackFigure } from './FallbackFigure'
import { GraphFigure } from './GraphFigure'
import { PipelineFigure } from './PipelineFigure'

const CHECK_CALC = `
func checkCalc(c *Calc, answer string) error {
  want, err := strconv.ParseFloat(answer, 64)
  if err != nil {
    return nil
  }
  got, err := c.Eval()
  if err != nil {
    return nil
  }
  tol := math.Max(0.02*math.Abs(want), 0.5*math.Pow(10, -decimals(answer)))
  if math.IsNaN(got) || math.Abs(got-want) > tol {
    return fmt.Errorf("formula gives %g, answer says %s", got, answer)
  }
  return nil
}
`

const FREE_VARS = `
a, _ := c.evalWith(free, 1.7)
b, _ := c.evalWith(free, 2.9)
if math.Abs(a-b) > 1e-9*math.Max(1, math.Abs(a)) {
  return 0, fmt.Errorf("answer depends on values that are not given: %v", free)
}
`

const POOL = `
DELETE FROM task_pool
WHERE id = (
  SELECT id FROM task_pool
  WHERE number = $1
  ORDER BY id
  LIMIT 1
  FOR UPDATE SKIP LOCKED
)
RETURNING task
`

export function LlmNote() {
	return (
		<NoteLayout
			date='Nov 19, 2026'
			readTime='9 min read'
			title={
				<>
					Don’t trust the generator: <span className='highlight'>self-checking</span>{' '}
					physics problems.
				</>
			}
			lead='physics.ai generates fresh exam problems with an LLM. Each one goes through a formula check, a blind solve by a second model and a review before a student ever sees it. Here is the whole gauntlet, with the parts you can poke at.'
		>
			<p>
				The worst thing an exam trainer can do is tell a student they are wrong
				when they are right. It costs more than a bad explanation: the student
				stops trusting the tool, or worse, starts trusting the wrong answer.
			</p>
			<p>
				An LLM that writes a physics problem also writes its answer key, and
				it writes it with the same confidence whether the arithmetic is right
				or not. It forgets a unit conversion, drops a force, leaves out a value
				the problem needs. The text looks fine. The number at the bottom does
				not.
			</p>
			<p>
				So in physics.ai the generator is never the last word. Every problem
				goes through a chain of checks, and most of them are designed so that
				the model cannot just agree with itself.
			</p>

			<PipelineFigure />

			<h2>
				<span className='h-num'>01</span>Show your math, in a form a machine
				can run
			</h2>
			<p>
				Besides the usual <em>Condition</em>, <em>Hint</em>, <em>Solution</em>{' '}
				and <em>Answer</em>, the prompt asks the generator for one more line: a
				JSON with the answer formula and every value in SI units.
			</p>
			<p>
				The server evaluates that formula with{' '}
				<a
					className='text-link'
					href='https://github.com/expr-lang/expr'
					target='_blank'
					rel='noopener noreferrer'
				>
					expr-lang
				</a>{' '}
				and compares it with the answer the model wrote. This catches the
				cheapest and most common failure: a correct idea with a broken
				calculation.
			</p>

			<CalcFigure />

			<Code file='calc.go'>{CHECK_CALC}</Code>

			<p>
				The tolerance is 2% of the answer or half of its last digit, whichever
				is larger. Exam answers are rounded, so an exact comparison would reject
				good problems.
			</p>
			<p>
				The trick I like most is the one for missing data. If the formula uses
				a name that has no value, the server plugs in two different numbers
				for it and evaluates twice. If the result changes, the answer depends
				on something the student was never told, and the problem is rejected.
				If it doesn’t change, the name cancels out and the problem is fine.
			</p>

			<Code file='calc.go'>{FREE_VARS}</Code>

			<p>
				One honest caveat: when the formula itself fails to parse, the check is
				skipped, not failed. It is a filter, not a proof, which is why it is not
				the only one.
			</p>

			<h2>
				<span className='h-num'>02</span>Solve it again, without the answer
			</h2>
			<p>
				The formula check trusts the model’s own reasoning. If the model set up
				the physics wrong, its formula and its answer will agree with each other
				perfectly and both be wrong.
			</p>
			<p>
				So a second call solves the problem from scratch. It gets only the
				condition: no answer, no hint, no solution. The author runs at
				temperature 0.9 so the problems vary; the solver runs at 0.1 because
				it should be careful, not creative. Then the server compares the two
				answers with the same tolerance.
			</p>

			<BlindFigure />

			<p>
				When they disagree, the author gets one chance to repair: it reads the
				solver’s full solution and has to find the cause, whether it is its own
				arithmetic, missing data or a wording that allows two readings. Then the
				solver checks again. If they still disagree, the problem is dropped.
				One repair round is enough to save most good ideas, and more rounds
				mostly teach the model to argue.
			</p>

			<h2>
				<span className='h-num'>03</span>Don’t let the model draw
			</h2>
			<p>
				Exam problems are full of graphs and circuits, and LLMs are bad at
				drawing them. A TikZ picture that compiles is rare; one that matches the
				numbers in the text is rarer.
			</p>
			<p>
				So the model doesn’t draw. It writes a marker with data,{' '}
				<code>[[GRAPH …]]</code> with the points of a broken line or{' '}
				<code>[[CIRCUIT …]]</code> with a tree of series and parallel elements,
				and the server renders the picture. The blind solver gets the same
				structure as plain text, so both of them look at exactly the same
				graph.
			</p>

			<GraphFigure />

			<h2>
				<span className='h-num'>04</span>An examiner with a rubric
			</h2>
			<p>
				A problem can be correct and still useless: too easy, or not the shape
				of the exam task it claims to be. The last call plays an examiner. It
				gets the problem and two real problems of the same number from the
				official bank, and answers in JSON: does it match the format, is the
				condition unambiguous, and how hard is it from 1 to 5.
			</p>
			<p>
				A problem passes with the right format, a correct condition and a
				difficulty of at least 3, the level of a typical exam problem. Each
				request gets two attempts. If neither passes the review, the hardest one
				that still passed the blind solve is used, so a picky examiner never
				leaves a student with nothing.
			</p>

			<h2>
				<span className='h-num'>05</span>Never make the student wait
			</h2>
			<p>
				All of this takes several model calls, which is fine for quality and
				terrible for a student who just pressed <em>next problem</em>. So the
				checks mostly run before anyone asks.
			</p>
			<p>
				Each exam number has a small pool of problems that already passed
				everything. Taking one is a single query that also works when several
				servers take at the same time:
			</p>

			<Code file='pool.go'>{POOL}</Code>

			<p>
				<code>SKIP LOCKED</code> lets two requests take two different problems
				instead of waiting on each other. Every take triggers a background
				refill for that number, and only one refill per number runs at a time.
			</p>
			<p>
				When the pool is empty, the server generates live with a 20-second
				deadline. If the deadline hits, the student gets a real problem of the
				same number from the official FIPI bank, one they haven’t solved yet.
			</p>

			<FallbackFigure />

			<h2>
				<span className='h-num'>06</span>What I took away
			</h2>
			<ul className='takeaways'>
				<li>
					<strong>The checker must not see the answer.</strong> A model asked
					“is 5.7 right?” tends to say yes. A model asked “what is the answer?”
					has no such bias.
				</li>
				<li>
					<strong>Ask for output a machine can verify.</strong> A formula and
					values in SI are cheap to produce and catch most arithmetic slips
					before any second model runs.
				</li>
				<li>
					<strong>Let the model describe, let code render.</strong> Structured
					markers for graphs and circuits are easier to check and easier to
					draw than pictures.
				</li>
				<li>
					<strong>Have a boring fallback.</strong> A real exam problem in 20
					seconds beats a clever one in a minute.
				</li>
			</ul>
		</NoteLayout>
	)
}
