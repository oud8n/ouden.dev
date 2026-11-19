import { Code } from '../Code'
import { NoteLayout } from '../NoteLayout'
import { BurstFigure } from './BurstFigure'
import { LostUpdateFigure } from './LostUpdateFigure'
import { RewardFigure } from './RewardFigure'

const SPEND_JSON = `
func (r *Repository) SpendCredits(userID string, amount int) (int, error) {
  db, err := r.read() // the whole wallets.json
  if err != nil {
    return 0, err
  }
  for i, w := range db.Wallets {
    if w.UserID == userID {
      if w.Balance < amount {
        return w.Balance, ErrInsufficient
      }
      db.Wallets[i].Balance -= amount
      return db.Wallets[i].Balance, r.write(db)
    }
  }
  return 0, ErrNoWallet
}
`

const MUTEX = `
type Repository struct {
  store *storage.JSONStore
  mu    sync.Mutex // held across read, check and write
}

func (r *Repository) SpendCredits(userID string, amount int) (int, error) {
  r.mu.Lock()
  defer r.mu.Unlock()
  // ...the same read, check and write as before
}
`

const SPEND_SQL = `
UPDATE wallets
SET balance = balance - $2, updated_at = now()
WHERE user_id = $1 AND balance >= $2
RETURNING balance
`

const SPEND_GO = `
err = r.pool.QueryRow(ctx, spendSQL, userID, amount).Scan(&balance)
if errors.Is(err, pgx.ErrNoRows) {
  return current, ErrInsufficient
}
`

const ADD_SQL = `
INSERT INTO wallets (user_id, balance) VALUES ($1, 100 + $2)
ON CONFLICT (user_id) DO UPDATE
SET balance = wallets.balance + $2, updated_at = now()
RETURNING balance
`

const TEST = `
const workers = 20
for i := 0; i < workers; i++ {
  wg.Add(1)
  go func() {
    defer wg.Done()
    if _, err := repo.SpendCredits(ctx, user, HintCost); err == nil {
      mu.Lock()
      succeeded++
      mu.Unlock()
    }
  }()
}
wg.Wait()
// 100 / 10: exactly ten succeed, and the wallet ends at 0
`

const PAID_TASK = `
tx, err := r.pool.Begin(ctx)
defer tx.Rollback(ctx)

insertTask(ctx, tx, t)
// UPDATE wallets ... WHERE balance >= $2 RETURNING balance
// no rows → ErrInsufficient, and the task insert rolls back with it
tx.Exec(ctx, \`INSERT INTO task_sessions (user_id, task_id, task_number, cost) ...\`)

return balance, tx.Commit(ctx)
`

const ATTEMPT = `
SELECT task_number, attempts, outcome FROM task_sessions
WHERE user_id = $1 AND task_id = $2
FOR UPDATE
`

const BONUS = `
INSERT INTO first_try_bonuses (user_id, task_number, day)
VALUES ($1, $2, (now() AT TIME ZONE 'Europe/Moscow')::date)
ON CONFLICT DO NOTHING
`

export function CreditsNote() {
	return (
		<NoteLayout
			date='Nov 19, 2026'
			readTime='8 min read'
			title={
				<>
					Credits without a mutex: let <span className='highlight'>PostgreSQL</span> count
					the money.
				</>
			}
			lead='In physics.ai problems and hints cost credits. The first version read the balance, checked it in Go and wrote it back, and a burst of requests got several hints for the price of one. This is how it went from a race to a mutex to a single UPDATE, and how the same idea pays rewards exactly once.'
		>
			<p>
				physics.ai is an exam trainer, and credits are its small economy. A
				student starts with a balance, opening a generated problem costs 10, a
				hint costs 10, and a correct answer pays some of it back. It is not
				real money, but it behaves like money in one important way: if you can
				spend the same credits twice, people will.
			</p>
			<p>
				Every bug in this note has the same shape. Code reads a value, makes a
				decision about it, and writes a new value back. Between the read and
				the write something else happens, and the decision is made about a
				world that no longer exists.
			</p>

			<h2>
				<span className='h-num'>01</span>Read, check, write
			</h2>
			<p>
				In August the backend kept wallets in a JSON file. The storage layer
				locked each <code>Read</code> and each <code>Write</code>, so the file
				itself never got corrupted. Spending looked like this:
			</p>

			<Code file='credits/repository.go · August'>{SPEND_JSON}</Code>

			<p>
				Each step is safe on its own. The sequence is not. Two requests can
				both read 200, both decide that 200 is enough for a 50-credit hint, and
				both write 150. Two hints are handed out and one charge disappears.
				This is a <em>lost update</em>.
			</p>
			<p>
				It was not theoretical. The hint endpoint only required a login, and
				the rate limiter allowed a burst of 30 requests per IP, so a few
				parallel clicks or a short script in the browser console were enough.
				The security review filed it as SEC-002, severity high.
			</p>

			<LostUpdateFigure />

			<h2>
				<span className='h-num'>02</span>A mutex is a promise about one
				process
			</h2>
			<p>
				The first fix was the obvious one: hold a <code>sync.Mutex</code>{' '}
				across the whole read, check and write, so nobody can get in between.
			</p>

			<Code file='credits/repository.go · August, fixed'>{MUTEX}</Code>

			<p>
				It was correct, and for a single JSON file it was the right size. But
				it came with two strings attached. The ticket already called out the
				first one as something to revisit once there was a real database.
			</p>
			<ul className='steps'>
				<li>
					<strong>One lock for every wallet.</strong> A student spending a hint
					waits for an unrelated student’s top-up. Fine at our scale, wrong in
					principle: the conflict is per wallet, the lock is global.
				</li>
				<li>
					<strong>The lock lives in memory.</strong> It protects the balance
					only as long as every write goes through this one process. A second
					instance, a migration script or an admin tool has its own memory and
					its own mutex, and the race is back. Pick{' '}
					<em>mutex, two processes</em> in figure 1.
				</li>
			</ul>
			<p>
				When the JSON store moved to PostgreSQL in November, the second point
				stopped being hypothetical. The database is shared by anything that can
				connect to it. The rule <em>“never go below zero”</em> had to live
				where the balance lives.
			</p>

			<h2>
				<span className='h-num'>03</span>Let the database decide
			</h2>
			<p>
				The whole read, check and write fits into one statement. The check
				moves into <code>WHERE</code>, and <code>RETURNING</code> hands back the
				new balance:
			</p>

			<Code file='spend.sql'>{SPEND_SQL}</Code>

			<p>
				There is no separate read to go stale. If the balance is too low, the
				row simply does not match, the statement updates nothing, and the Go
				side turns <em>no rows</em> into a normal business error:
			</p>

			<Code file='credits/repository.go'>{SPEND_GO}</Code>

			<p>
				What makes this safe under concurrency is how PostgreSQL handles two
				updates of the same row. The second one waits for the first to commit.
				Then, under the default <code>READ COMMITTED</code> isolation, it
				re-checks its <code>WHERE</code> against the row the first one left
				behind. If that row now has 0, it no longer matches, and the second
				update quietly does nothing. No lock in Go, no retry loop, no
				transaction around a single statement.
			</p>

			<BurstFigure />

			<p>
				Two more things came for free. Different students update different
				rows, so they never wait for each other: the lock is exactly as wide as
				the conflict. And the rule now holds for every client of the database,
				not just for this Go process.
			</p>
			<p>
				Adding credits uses the same idea. The wallet is created lazily with a
				starting balance, and creating it and topping it up are one upsert, so
				two first requests cannot both create a wallet or lose each other’s
				top-up:
			</p>

			<Code file='add.sql'>{ADD_SQL}</Code>

			<p>
				The test for all of this is short and runs against a real PostgreSQL,
				because a mock cannot reproduce row locks. Twenty goroutines spend 10
				each from a balance of 100:
			</p>

			<Code file='credits/repository_test.go'>{TEST}</Code>

			<p>
				It checks two numbers, not one. Ten successes alone would also pass a
				version that loses updates and happens to refuse the rest. The wallet
				ending at exactly 0 is the proof that every charge landed.
			</p>

			<h2>
				<span className='h-num'>04</span>Charge and create in one transaction
			</h2>
			<p>
				Opening a generated problem is more than a charge. The problem is
				saved, the wallet is charged, and a session is opened to track the
				attempts. If any of that fails, none of it should stay.
			</p>

			<Code file='task/session.go'>{PAID_TASK}</Code>

			<p>
				The charge is the same conditional <code>UPDATE</code>, just inside a
				transaction. An empty wallet rolls back the saved problem too. And the
				charge only happens after the model has produced a problem: if
				generation fails, the student gets an error and keeps their credits.
			</p>

			<h2>
				<span className='h-num'>05</span>Pay back exactly once
			</h2>
			<p>
				A correct answer pays a reward: 10 on the first try, 5 on the second, 2
				on the third, and a bonus of 15 for the first first-try solve of each
				exam number per day. Rewards have the opposite risk of charges. Nobody
				tries to pay twice, but plenty of clients try to get paid twice: a
				double click, a retry after a slow response, a second tab.
			</p>
			<p>
				Here a single <code>UPDATE</code> is not enough, because the reward
				depends on several things at once: which attempt this is, whether the
				session is already finished, whether today’s bonus is taken. So the
				attempt locks the session row first and does everything else while
				holding it:
			</p>

			<Code file='task/session.go'>{ATTEMPT}</Code>

			<p>
				Every other request for the same session waits on that row. When it
				gets it, the session is already marked <em>solved</em>, and a finished
				session never pays again: the request just reads the balance and
				returns.
			</p>

			<RewardFigure />

			<p>
				The daily bonus does not need a lock at all. It is a row with a unique
				key, and inserting it is the check:
			</p>

			<Code file='task/session.go'>{BONUS}</Code>

			<p>
				One row inserted means the bonus is yours, zero rows means someone took
				it today. Toggle <em>without FOR UPDATE</em> in figure 3 and you can see
				that the bonus table holds on its own, while the session does not.
			</p>

			<h2>
				<span className='h-num'>06</span>What I took away
			</h2>
			<ul className='takeaways'>
				<li>
					<strong>Look for read, decide, write.</strong> Wherever a decision is
					made in application code about a value that is stored elsewhere,
					there is a window. Two parallel requests will find it.
				</li>
				<li>
					<strong>Put the rule where the data lives.</strong> A mutex protects
					one process. A <code>WHERE</code> clause protects every client of the
					database.
				</li>
				<li>
					<strong>Prefer one statement to a transaction.</strong> A conditional{' '}
					<code>UPDATE … RETURNING</code> or an upsert is atomic by itself. Reach
					for <code>FOR UPDATE</code> when the decision really needs several
					reads.
				</li>
				<li>
					<strong>Let a unique key say “only once”.</strong>{' '}
					<code>ON CONFLICT DO NOTHING</code> turns “has this already happened?”
					into an insert that either works or does not.
				</li>
				<li>
					<strong>Test against the real database.</strong> Row locks and
					re-checks are behavior of PostgreSQL. A mock will happily pass code
					that loses money.
				</li>
			</ul>
		</NoteLayout>
	)
}
