import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatChartData, formatCurrency } from '../../lib/api/admin/analytics'

export default function WeeklyChart({ weeklyEvolution }) {
    if (!weeklyEvolution) {
        return (
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="h-80 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                        <div className="text-gray-400">Chargement du graphique...</div>
                    </div>
                </div>
            </div>
        )
    }

    const chartData = formatChartData(weeklyEvolution)

    // Tooltip personnalisé
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            ></div>
                            <span className="text-gray-600">{entry.name}:</span>
                            <span className="font-medium text-gray-900">
                                {entry.dataKey === 'revenus'
                                    ? formatCurrency(entry.value * 100)
                                    : entry.value.toLocaleString('fr-FR')
                                }
                            </span>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    // Configuration des lignes
    const lineConfig = [
        {
            dataKey: 'demandes',
            name: 'Demandes',
            stroke: '#3B82F6', // blue-500
            strokeWidth: 2,
            dot: { fill: '#3B82F6', strokeWidth: 2, r: 4 },
            activeDot: { r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }
        },
        {
            dataKey: 'factures',
            name: 'Factures',
            stroke: '#10B981', // emerald-500
            strokeWidth: 2,
            dot: { fill: '#10B981', strokeWidth: 2, r: 4 },
            activeDot: { r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }
        },
        {
            dataKey: 'revenus',
            name: 'Revenus (€)',
            stroke: '#F59E0B', // amber-500
            strokeWidth: 2,
            dot: { fill: '#F59E0B', strokeWidth: 2, r: 4 },
            activeDot: { r: 6, stroke: '#F59E0B', strokeWidth: 2, fill: '#fff' }
        }
    ]

    // Calcul des totaux pour affichage
    const totals = chartData.reduce((acc, day) => {
        acc.demandes += day.demandes
        acc.factures += day.factures
        acc.revenus += day.revenus
        return acc
    }, { demandes: 0, factures: 0, revenus: 0 })

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Évolution sur 7 jours</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Suivi quotidien de l'activité
                        </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-gray-600">
                                {totals.demandes} demande{totals.demandes > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-gray-600">
                                {totals.factures} facture{totals.factures > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-gray-600">
                                {formatCurrency(totals.revenus * 100)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#f1f5f9"
                                horizontal={true}
                                vertical={false}
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b' }}
                                dx={-10}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                                formatter={(value) => (
                                    <span className="text-sm text-gray-600">{value}</span>
                                )}
                            />
                            {lineConfig.map((line) => (
                                <Line
                                    key={line.dataKey}
                                    type="monotone"
                                    dataKey={line.dataKey}
                                    name={line.name}
                                    stroke={line.stroke}
                                    strokeWidth={line.strokeWidth}
                                    dot={line.dot}
                                    activeDot={line.activeDot}
                                    connectNulls={true}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Message si pas de données */}
                {chartData.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">Aucune donnée disponible pour cette période</p>
                    </div>
                )}
            </div>
        </div>
    )
}