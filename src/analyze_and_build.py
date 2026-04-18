import json
from pathlib import Path
import shutil
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, roc_curve

ROOT = Path('/mnt/data/balaji_ml_project')
FIG = ROOT / 'figures'
DATA = ROOT / 'data'
RAW = Path('/mnt/data/Balaji Fast Food Sales.csv')

shutil.copy2(RAW, DATA / 'Balaji Fast Food Sales.csv')

df = pd.read_csv(RAW)

def parse_mixed_date(x):
    s = str(x)
    if '-' in s:
        return pd.to_datetime(s, format='%d-%m-%Y', errors='coerce')
    if '/' in s:
        return pd.to_datetime(s, format='%m/%d/%Y', errors='coerce')
    return pd.to_datetime(s, errors='coerce')

df['date_parsed'] = df['date'].apply(parse_mixed_date)
df['month'] = df['date_parsed'].dt.month
df['day'] = df['date_parsed'].dt.day
df['dayofweek'] = df['date_parsed'].dt.dayofweek
df['day_name'] = df['date_parsed'].dt.day_name()
df['weekend'] = df['dayofweek'].isin([5, 6]).astype(int)
df['quarter'] = df['date_parsed'].dt.quarter
median_amount = float(df['transaction_amount'].median())
df['high_value_order'] = (df['transaction_amount'] >= median_amount).astype(int)

summary = {
    'rows': int(df.shape[0]),
    'columns': int(df.shape[1]),
    'date_min': str(df['date_parsed'].min().date()),
    'date_max': str(df['date_parsed'].max().date()),
    'missing_transaction_type': int(df['transaction_type'].isna().sum()),
    'unique_items': int(df['item_name'].nunique()),
    'median_transaction_amount': median_amount,
    'class_balance_high_value': float(df['high_value_order'].mean()),
    'top_items_by_revenue': df.groupby('item_name')['transaction_amount'].sum().sort_values(ascending=False).head(5).to_dict(),
    'top_items_by_quantity': df.groupby('item_name')['quantity'].sum().sort_values(ascending=False).head(5).to_dict(),
    'sales_by_time_of_sale': df.groupby('time_of_sale')['transaction_amount'].sum().sort_values(ascending=False).to_dict(),
}

plt.rcParams['figure.dpi'] = 150
item_rev = df.groupby('item_name')['transaction_amount'].sum().sort_values(ascending=False)
plt.figure(figsize=(8, 4.8))
item_rev.plot(kind='bar')
plt.title('Revenue by Menu Item')
plt.ylabel('Revenue')
plt.xlabel('Item')
plt.xticks(rotation=30, ha='right')
plt.tight_layout()
plt.savefig(FIG / 'revenue_by_item.png', bbox_inches='tight')
plt.close()

order_time = df['time_of_sale'].value_counts().reindex(['Morning', 'Afternoon', 'Evening', 'Night', 'Midnight'])
plt.figure(figsize=(8, 4.8))
order_time.plot(kind='bar')
plt.title('Order Count by Time of Sale')
plt.ylabel('Number of Orders')
plt.xlabel('Time of Sale')
plt.xticks(rotation=0)
plt.tight_layout()
plt.savefig(FIG / 'orders_by_time.png', bbox_inches='tight')
plt.close()

monthly_revenue = df.groupby(df['date_parsed'].dt.to_period('M'))['transaction_amount'].sum().sort_index()
plt.figure(figsize=(9, 4.8))
monthly_revenue.index = monthly_revenue.index.astype(str)
monthly_revenue.plot(marker='o')
plt.title('Monthly Revenue Trend')
plt.ylabel('Revenue')
plt.xlabel('Month')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig(FIG / 'monthly_revenue.png', bbox_inches='tight')
plt.close()

trans_dist = df['transaction_type'].fillna('Missing').value_counts()
plt.figure(figsize=(6.5, 4.8))
trans_dist.plot(kind='bar')
plt.title('Transaction Type Distribution')
plt.ylabel('Count')
plt.xlabel('Transaction Type')
plt.xticks(rotation=0)
plt.tight_layout()
plt.savefig(FIG / 'transaction_type_distribution.png', bbox_inches='tight')
plt.close()

class_dist = df['high_value_order'].map({0: 'Low Value', 1: 'High Value'}).value_counts()
plt.figure(figsize=(6.5, 4.8))
class_dist.plot(kind='bar')
plt.title('Target Class Balance')
plt.ylabel('Count')
plt.xlabel('Order Class')
plt.xticks(rotation=0)
plt.tight_layout()
plt.savefig(FIG / 'target_balance.png', bbox_inches='tight')
plt.close()

features = ['item_name', 'item_type', 'item_price', 'transaction_type', 'received_by', 'time_of_sale', 'month', 'day', 'dayofweek', 'weekend', 'quarter']
X = df[features]
y = df['high_value_order']
cat_cols = ['item_name', 'item_type', 'transaction_type', 'received_by', 'time_of_sale']
num_cols = [c for c in features if c not in cat_cols]

preprocess = ColumnTransformer([
    ('cat', Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ]), cat_cols),
    ('num', Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ]), num_cols)
])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

pipelines = {
    'Logistic Regression': Pipeline([('preprocess', preprocess), ('model', LogisticRegression(max_iter=2000, random_state=42))]),
    'Decision Tree': Pipeline([('preprocess', preprocess), ('model', DecisionTreeClassifier(random_state=42))]),
    'Random Forest': Pipeline([('preprocess', preprocess), ('model', RandomForestClassifier(random_state=42, n_jobs=1))]),
    'Gradient Boosting': Pipeline([('preprocess', preprocess), ('model', GradientBoostingClassifier(random_state=42))]),
}

param_grids = {
    'Logistic Regression': {'model__C': [0.1, 1.0, 10.0], 'model__solver': ['liblinear']},
    'Decision Tree': {'model__max_depth': [3, 5, None], 'model__min_samples_split': [2, 10]},
    'Random Forest': {'model__n_estimators': [100, 200], 'model__max_depth': [5, None]},
    'Gradient Boosting': {'model__n_estimators': [100], 'model__learning_rate': [0.05, 0.1], 'model__max_depth': [2, 3]},
}

results = []
roc_payload = {}
conf_mats = {}
best_estimators = {}
best_params = {}

for model_name, pipe in pipelines.items():
    print('Training', model_name, flush=True)
    grid = GridSearchCV(pipe, param_grid=param_grids[model_name], scoring='f1', cv=cv, n_jobs=1, verbose=0)
    grid.fit(X_train, y_train)
    best = grid.best_estimator_
    best_estimators[model_name] = best
    best_params[model_name] = grid.best_params_
    y_pred = best.predict(X_test)
    y_prob = best.predict_proba(X_test)[:, 1] if hasattr(best.named_steps['model'], 'predict_proba') else None
    results.append({
        'Model': model_name,
        'Best_CV_F1': round(float(grid.best_score_), 4),
        'Accuracy': round(float(accuracy_score(y_test, y_pred)), 4),
        'Precision': round(float(precision_score(y_test, y_pred)), 4),
        'Recall': round(float(recall_score(y_test, y_pred)), 4),
        'F1_Score': round(float(f1_score(y_test, y_pred)), 4),
        'ROC_AUC': round(float(roc_auc_score(y_test, y_prob)), 4) if y_prob is not None else None,
    })
    conf_mats[model_name] = confusion_matrix(y_test, y_pred).tolist()
    if y_prob is not None:
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        roc_payload[model_name] = {'fpr': fpr.tolist(), 'tpr': tpr.tolist(), 'auc': round(float(roc_auc_score(y_test, y_prob)), 4)}

results_df = pd.DataFrame(results).sort_values(['F1_Score', 'Accuracy'], ascending=False).reset_index(drop=True)
results_df.to_csv(ROOT / 'model_comparison.csv', index=False)

best_model_name = results_df.iloc[0]['Model']
best_model = best_estimators[best_model_name]

plt.figure(figsize=(7.5, 5.5))
for name, payload in roc_payload.items():
    plt.plot(payload['fpr'], payload['tpr'], label=f"{name} (AUC={payload['auc']:.3f})")
plt.plot([0, 1], [0, 1], linestyle='--')
plt.title('ROC Curve Comparison')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.legend(fontsize=8)
plt.tight_layout()
plt.savefig(FIG / 'roc_curves.png', bbox_inches='tight')
plt.close()

fig, axes = plt.subplots(2, 2, figsize=(9, 8))
axes = axes.flatten()
for ax, name in zip(axes, [r['Model'] for r in results]):
    cm = np.array(conf_mats[name])
    ax.imshow(cm)
    ax.set_title(name, fontsize=10)
    ax.set_xlabel('Predicted')
    ax.set_ylabel('Actual')
    ax.set_xticks([0, 1], ['Low', 'High'])
    ax.set_yticks([0, 1], ['Low', 'High'])
    for i in range(2):
        for j in range(2):
            ax.text(j, i, str(cm[i, j]), ha='center', va='center', fontsize=10)
fig.suptitle('Confusion Matrices on Test Set', fontsize=14)
fig.tight_layout(rect=[0, 0, 1, 0.96])
plt.savefig(FIG / 'confusion_matrices.png', bbox_inches='tight')
plt.close(fig)

model = best_model.named_steps['model']
feature_names = best_model.named_steps['preprocess'].get_feature_names_out()
if hasattr(model, 'feature_importances_'):
    scores = model.feature_importances_
else:
    scores = np.abs(model.coef_[0])
imp_df = pd.DataFrame({'feature': feature_names, 'importance': scores}).sort_values('importance', ascending=False).head(12)
imp_df.to_csv(ROOT / 'top_features.csv', index=False)
plt.figure(figsize=(8.5, 5.5))
plt.barh(imp_df['feature'][::-1], imp_df['importance'][::-1])
plt.title(f'Top Predictive Features - {best_model_name}')
plt.xlabel('Importance')
plt.tight_layout()
plt.savefig(FIG / 'feature_importance.png', bbox_inches='tight')
plt.close()

payload = {
    'problem_type': 'classification',
    'project_title': 'Predicting High-Value Orders in Balaji Fast Food Sales',
    'target_definition': f'high_value_order = 1 if transaction_amount >= {median_amount:.0f}, else 0',
    'leakage_note': 'Quantity and transaction_amount are excluded from the feature set to avoid direct target leakage.',
    'features_used': features,
    'train_size': int(len(X_train)),
    'test_size': int(len(X_test)),
    'best_model': best_model_name,
    'best_model_metrics': results_df.iloc[0].to_dict(),
    'best_params': best_params,
    'summary': summary,
}
with open(ROOT / 'project_summary.json', 'w') as f:
    json.dump(payload, f, indent=2)
with open(ROOT / 'summary.txt', 'w') as f:
    f.write(f"Project: {payload['project_title']}\n")
    f.write(f"Dataset size: {summary['rows']} rows, {summary['columns']} original columns\n")
    f.write(f"Date range: {summary['date_min']} to {summary['date_max']}\n")
    f.write(f"Missing transaction_type: {summary['missing_transaction_type']} rows\n")
    f.write(f"Target threshold: {median_amount:.0f}\n")
    f.write(f"Best model: {best_model_name}\n")
    f.write(f"Best test F1: {results_df.iloc[0]['F1_Score']} | Accuracy: {results_df.iloc[0]['Accuracy']} | ROC-AUC: {results_df.iloc[0]['ROC_AUC']}\n")

print(results_df.to_string(index=False))
print('\nBest model:', best_model_name)
print('Saved outputs to', ROOT)
