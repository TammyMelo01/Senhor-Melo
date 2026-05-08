import { CalendarDays, CreditCard, TrendingDown, TrendingUp } from "lucide-react";
import { CalendarItem, Transaction } from "@/lib/types";
import { formatCurrency, getFinanceSummary } from "@/lib/finance";
import { Modal } from "./Modal";

export function DashboardSummaryModal({
  open,
  type,
  events,
  transactions,
  onClose,
}: {
  open: boolean;
  type: "events" | "income" | "expenses" | "bills" | null;
  events: CalendarItem[];
  transactions: Transaction[];
  onClose: () => void;
}) {
  const summary = getFinanceSummary(transactions);

  const title =
    type === "events"
      ? "Próximos eventos"
      : type === "income"
      ? "Resumo de receitas"
      : type === "expenses"
      ? "Resumo de despesas"
      : "Contas e vencimentos";

  const list =
    type === "income"
      ? transactions.filter((item) => item.kind === "Receita")
      : type === "expenses"
      ? transactions.filter((item) => item.kind !== "Receita")
      : type === "bills"
      ? transactions.filter((item) => item.dueDate && !item.paid)
      : [];

  return (
    <Modal title={title} open={open} onClose={onClose}>
      {type === "events" && (
        <div className="summary-list">
          {events.map((event) => (
            <article key={event.id}>
              <CalendarDays size={18} />
              <div>
                <strong>{event.title}</strong>
                <span>
                  {event.date} • {event.start} - {event.end} • {event.memberName}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {type === "income" && (
        <>
          <div className="summary-total green">
            <TrendingUp />
            <strong>{formatCurrency(summary.income)}</strong>
            <span>Total recebido no mês</span>
          </div>
          <div className="summary-list">
            {list.map((item) => (
              <article key={item.id}>
                <TrendingUp size={18} />
                <div>
                  <strong>{item.description}</strong>
                  <span>
                    {item.category} • {item.memberName} • {formatCurrency(item.value)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {type === "expenses" && (
        <>
          <div className="summary-total red">
            <TrendingDown />
            <strong>{formatCurrency(summary.expenses)}</strong>
            <span>Total gasto no mês</span>
          </div>
          <div className="summary-list">
            {list.map((item) => (
              <article key={item.id}>
                <TrendingDown size={18} />
                <div>
                  <strong>{item.description}</strong>
                  <span>
                    {item.category} • {item.memberName} • {formatCurrency(item.value)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {type === "bills" && (
        <div className="summary-list">
          {list.map((item) => (
            <article key={item.id}>
              <CreditCard size={18} />
              <div>
                <strong>{item.description}</strong>
                <span>
                  Vence em {item.dueDate} • {formatCurrency(item.value)}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </Modal>
  );
}
