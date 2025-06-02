import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
import warnings
warnings.filterwarnings('ignore')

class AdvancedEngagementAnalyzer:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.gb_classifier = GradientBoostingClassifier(n_estimators=100, random_state=42)
        self.neural_network = None
        self.lstm_model = None

    def load_data_from_json(self, file_path="/content/instagram_data.json"):
        with open(file_path, 'r') as file:
            data = json.load(file)
        return data

    def extract_temporal_features(self, posts_data):
        temporal_features = []
        for post in posts_data:
            timestamp = pd.to_datetime(post['timestamp'])
            features = {
                'hour': timestamp.hour,
                'day_of_week': timestamp.dayofweek,
                'month': timestamp.month,
                'is_weekend': timestamp.dayofweek >= 5,
                'quarter': timestamp.quarter
            }
            temporal_features.append(features)
        return temporal_features

    def calculate_advanced_metrics(self, user_data):
        posts = user_data.get('posts', [])
        if not posts:
            return self._empty_metrics()

        likes_array = np.array([post.get('likes', 0) for post in posts])
        temporal_features = self.extract_temporal_features(posts)

        metrics = {
            'engagement_velocity': np.gradient(likes_array).mean(),
            'volatility_index': np.std(likes_array) / np.mean(likes_array) if np.mean(likes_array) > 0 else 0,
            'momentum_score': self._calculate_momentum(likes_array),
            'consistency_ratio': self._calculate_consistency(likes_array),
            'peak_performance_index': self._calculate_peak_index(likes_array),
            'temporal_correlation': self._temporal_correlation_analysis(temporal_features, likes_array),
            'growth_trajectory': self._calculate_growth_trajectory(likes_array),
            'audience_retention_score': self._calculate_retention_score(likes_array)
        }

        return metrics

    def _calculate_momentum(self, likes_array):
        if len(likes_array) < 3:
            return 0
        recent_avg = np.mean(likes_array[-3:])
        historical_avg = np.mean(likes_array[:-3]) if len(likes_array) > 3 else np.mean(likes_array)
        return (recent_avg - historical_avg) / historical_avg if historical_avg > 0 else 0

    def _calculate_consistency(self, likes_array):
        if len(likes_array) < 2:
            return 0
        cv = np.std(likes_array) / np.mean(likes_array) if np.mean(likes_array) > 0 else float('inf')
        return 1 / (1 + cv)

    def _calculate_peak_index(self, likes_array):
        if len(likes_array) == 0:
            return 0
        max_likes = np.max(likes_array)
        avg_likes = np.mean(likes_array)
        return max_likes / avg_likes if avg_likes > 0 else 0

    def _temporal_correlation_analysis(self, temporal_features, likes_array):
        if len(temporal_features) == 0:
            return 0
        df = pd.DataFrame(temporal_features)
        df['likes'] = likes_array
        correlations = df.corr()['likes'].drop('likes')
        return correlations.abs().mean()

    def _calculate_growth_trajectory(self, likes_array):
        if len(likes_array) < 2:
            return 0
        x = np.arange(len(likes_array))
        slope = np.polyfit(x, likes_array, 1)[0]
        return slope / np.mean(likes_array) if np.mean(likes_array) > 0 else 0

    def _calculate_retention_score(self, likes_array):
        if len(likes_array) < 5:
            return 0
        recent_performance = np.mean(likes_array[-5:])
        peak_performance = np.max(likes_array)
        return recent_performance / peak_performance if peak_performance > 0 else 0

    def _empty_metrics(self):
        return {key: 0 for key in [
            'engagement_velocity', 'volatility_index', 'momentum_score',
            'consistency_ratio', 'peak_performance_index', 'temporal_correlation',
            'growth_trajectory', 'audience_retention_score'
        ]}

    def build_neural_network(self, input_dim):
        model = Sequential([
            Dense(256, activation='relu', input_dim=input_dim),
            BatchNormalization(),
            Dropout(0.3),
            Dense(128, activation='relu'),
            BatchNormalization(),
            Dropout(0.3),
            Dense(64, activation='relu'),
            Dropout(0.2),
            Dense(32, activation='relu'),
            Dense(5, activation='softmax')
        ])

        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )

        return model

    def build_lstm_model(self, sequence_length, features):
        model = Sequential([
            LSTM(128, return_sequences=True, input_shape=(sequence_length, features)),
            Dropout(0.2),
            LSTM(64, return_sequences=False),
            Dropout(0.2),
            Dense(50, activation='relu'),
            Dense(1, activation='linear')
        ])

        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='mse',
            metrics=['mae']
        )

        return model

    def advanced_sentiment_classification(self, metrics):
        feature_vector = np.array([
            metrics['engagement_velocity'],
            metrics['volatility_index'],
            metrics['momentum_score'],
            metrics['consistency_ratio'],
            metrics['peak_performance_index'],
            metrics['temporal_correlation'],
            metrics['growth_trajectory'],
            metrics['audience_retention_score']
        ]).reshape(1, -1)

        scaled_features = self.scaler.fit_transform(feature_vector)

        composite_score = (
            metrics['momentum_score'] * 0.25 +
            metrics['consistency_ratio'] * 0.20 +
            metrics['growth_trajectory'] * 0.20 +
            metrics['audience_retention_score'] * 0.15 +
            metrics['engagement_velocity'] * 0.10 +
            (1 - metrics['volatility_index']) * 0.10
        )

        if composite_score >= 0.8:
            return 'Extreme Bullish'
        elif composite_score >= 0.6:
            return 'Bullish'
        elif composite_score >= 0.4:
            return 'Neutral'
        elif composite_score >= 0.2:
            return 'Bearish'
        else:
            return 'Extreme Bearish'

    def ensemble_prediction(self, features_matrix):
        rf_predictions = self.rf_model.predict(features_matrix)
        gb_predictions = self.gb_classifier.predict_proba(features_matrix)

        if self.neural_network:
            nn_predictions = self.neural_network.predict(features_matrix)
            ensemble_score = (rf_predictions * 0.4 +
                            gb_predictions.max(axis=1) * 0.35 +
                            nn_predictions.max(axis=1) * 0.25)
        else:
            ensemble_score = (rf_predictions * 0.6 + gb_predictions.max(axis=1) * 0.4)

        return ensemble_score

    def analyze_portfolio_risk(self, user_metrics_list):
        risk_matrix = np.array([[metrics['volatility_index'],
                               metrics['consistency_ratio']]
                              for metrics in user_metrics_list])

        portfolio_volatility = np.mean(risk_matrix[:, 0])
        portfolio_consistency = np.mean(risk_matrix[:, 1])

        risk_score = portfolio_volatility / portfolio_consistency if portfolio_consistency > 0 else float('inf')

        if risk_score < 0.2:
            return 'Low Risk'
        elif risk_score < 0.5:
            return 'Medium Risk'
        else:
            return 'High Risk'

    def generate_recommendations(self, analysis_results):
        sorted_users = sorted(analysis_results.items(),
                            key=lambda x: x[1]['composite_score'], reverse=True)

        recommendations = {
            'top_performers': [user for user, data in sorted_users[:5]],
            'emerging_talents': [user for user, data in sorted_users
                               if data['sentiment'] == 'Bullish'][:3],
            'value_picks': [user for user, data in sorted_users
                          if data['sentiment'] == 'Neutral' and
                          data['growth_trajectory'] > 0][:3],
            'avoid_list': [user for user, data in sorted_users
                         if data['sentiment'] in ['Bearish', 'Extreme Bearish']]
        }

        return recommendations

def main():
    analyzer = AdvancedEngagementAnalyzer()

    try:
        instagram_data = analyzer.load_data_from_json()
    except FileNotFoundError:
        print("Data file not found. Please ensure /content/instagram_data.json exists.")
        return

    analysis_results = {}
    features_matrix = []

    for user_data in instagram_data:
        username = user_data['username']
        metrics = analyzer.calculate_advanced_metrics(user_data)
        sentiment = analyzer.advanced_sentiment_classification(metrics)

        analysis_results[username] = {
            'metrics': metrics,
            'sentiment': sentiment,
            'composite_score': (metrics['momentum_score'] * 0.25 +
                              metrics['consistency_ratio'] * 0.20 +
                              metrics['growth_trajectory'] * 0.20)
        }

        feature_vector = [
            metrics['engagement_velocity'],
            metrics['volatility_index'],
            metrics['momentum_score'],
            metrics['consistency_ratio'],
            metrics['peak_performance_index'],
            metrics['temporal_correlation'],
            metrics['growth_trajectory'],
            metrics['audience_retention_score']
        ]
        features_matrix.append(feature_vector)

    features_matrix = np.array(features_matrix)

    if len(features_matrix) > 10:
        analyzer.neural_network = analyzer.build_neural_network(features_matrix.shape[1])
        analyzer.lstm_model = analyzer.build_lstm_model(10, features_matrix.shape[1])

    portfolio_risk = analyzer.analyze_portfolio_risk([data['metrics'] for data in analysis_results.values()])
    recommendations = analyzer.generate_recommendations(analysis_results)

    print("Advanced Instagram Engagement Analysis Complete")
    print(f"Analyzed {len(analysis_results)} accounts")
    print(f"Portfolio Risk Level: {portfolio_risk}")
    print(f"Top Performers: {recommendations['top_performers']}")

    return analysis_results, recommendations

if __name__ == "__main__":
    results, recommendations = main()