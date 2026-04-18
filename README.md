# Predicting High-Value Orders in Balaji Fast Food Sales

## Project Summary
This project uses the **Balaji Fast Food Sales** dataset to build a machine learning classifier that predicts whether an order is **high value** or **low value**.

- **Problem type:** Classification
- **Target:** `high_value_order`
- **Definition:** `1` if `transaction_amount >= 240`, otherwise `0`
- **Why this problem?**
  - Direct sales regression is not ideal here because `transaction_amount = item_price * quantity`, which would make the target too easy to reconstruct.
  - Predicting a high-value order from customer and order context is more realistic and better for model comparison.

## Dataset
- **Rows:** 1000
- **Original columns:** 10
- **Date range:** 2022-01-04 to 2023-12-03
- **Menu items:** 7
- **Missing values:** 107 missing values in `transaction_type`

### Features used
- `item_name`
- `item_type`
- `item_price`
- `transaction_type`
- `received_by`
- `time_of_sale`
- `month`
- `day`
- `dayofweek`
- `weekend`
- `quarter`

### Leakage prevention
To avoid target leakage, the model **does not use**:
- `transaction_amount`
- `quantity`

## Algorithms Compared
- Logistic Regression
- Decision Tree Classifier
- Random Forest Classifier
- Gradient Boosting Classifier

## Best Result
The best model in this package is:
- **Decision Tree**
- **Accuracy:** 0.750
- **F1-score:** 0.7396
- **ROC-AUC:** 0.7814

## Project Structure
```text
balaji_ml_project/
│── data/
│   └── Balaji Fast Food Sales.csv
│── figures/
│   ├── revenue_by_item.png
│   ├── orders_by_time.png
│   ├── monthly_revenue.png
│   ├── transaction_type_distribution.png
│   ├── target_balance.png
│   ├── roc_curves.png
│   ├── confusion_matrices.png
│   └── feature_importance.png
│── notebooks/
│   └── balaji_ml_project.ipynb
│── src/
│   └── analyze_and_build.py
│── model_comparison.csv
│── top_features.csv
│── project_summary.json
│── requirements.txt
└── README.md
```

## How to Run
### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the analysis script
```bash
python src/analyze_and_build.py
```

### 3. Open the notebook
Open `notebooks/balaji_ml_project.ipynb` in Jupyter Notebook or VS Code.

## Evaluation Metrics
This project compares models using:
- Accuracy
- Precision
- Recall
- F1-score
- ROC-AUC

## Suggested Team Contribution Split
You can adjust this section to match your real group members.

### Example for 2 students
- **Student A:** Logistic Regression + EDA
- **Student B:** Decision Trees + Random Forest + Slides

### Example for 3 students
- **Student A:** Logistic Regression
- **Student B:** Decision Tree
- **Student C:** Random Forest / Gradient Boosting

## Notes for Final Submission
Before submitting:
- Push the project folder to GitHub
- Make sure each team member has meaningful commits
- Update this README with your actual team member names
- Add screenshots or a GIF if your instructor likes more visual GitHub repos
