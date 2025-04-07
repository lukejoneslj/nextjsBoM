import json
import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud
import numpy as np
from pathlib import Path

# Set style
plt.style.use('default')
sns.set_palette("husl")

# Function to load all JSON files
def load_json_files(directory):
    data = []
    for file in os.listdir(directory):
        if file.endswith('_analysis.json'):
            with open(os.path.join(directory, file), 'r') as f:
                book_data = json.load(f)
                for chapter in book_data['chapters']:
                    chapter['book'] = book_data['book']
                    data.append(chapter)
    return pd.DataFrame(data)

# Function to create score distribution plots
def plot_score_distributions(df, output_dir):
    plt.figure(figsize=(15, 5))
    score_columns = ['dignity_score', 'christ_centered_score', 'moral_score']
    
    for i, score in enumerate(score_columns, 1):
        plt.subplot(1, 3, i)
        sns.histplot(data=df[score].astype(float), bins=10)
        plt.title(f'{score.replace("_", " ").title()} Distribution')
        plt.xlabel('Score')
        plt.ylabel('Count')
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'score_distributions.png'))
    plt.close()

# Function to create average scores by book
def plot_average_scores_by_book(df, output_dir):
    score_columns = ['dignity_score', 'christ_centered_score', 'moral_score']
    avg_scores = df.groupby('book')[score_columns].mean()
    
    plt.figure(figsize=(15, 8))
    avg_scores.plot(kind='bar', width=0.8)
    plt.title('Average Scores by Book')
    plt.xlabel('Book')
    plt.ylabel('Average Score')
    plt.xticks(rotation=45, ha='right')
    plt.legend(title='Score Type')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'average_scores_by_book.png'))
    plt.close()

# Function to create score trends
def plot_score_trends(df, output_dir):
    plt.figure(figsize=(15, 8))
    score_columns = ['dignity_score', 'christ_centered_score', 'moral_score']
    
    for score in score_columns:
        plt.plot(df.index, df[score].astype(float), label=score.replace('_', ' ').title(), marker='o')
    
    plt.title('Score Trends Across Chapters')
    plt.xlabel('Chapter Index')
    plt.ylabel('Score')
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'score_trends.png'))
    plt.close()

# Function to create word cloud of invitations
def create_invitation_wordcloud(df, output_dir):
    text = ' '.join(df['invitation'].astype(str))
    wordcloud = WordCloud(width=1200, height=800, background_color='white').generate(text)
    
    plt.figure(figsize=(15, 10))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.title('Word Cloud of Chapter Invitations')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'invitation_wordcloud.png'))
    plt.close()

# Function to create correlation heatmap
def plot_correlation_heatmap(df, output_dir):
    score_columns = ['dignity_score', 'christ_centered_score', 'moral_score']
    correlation = df[score_columns].astype(float).corr()
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(correlation, annot=True, cmap='coolwarm', vmin=-1, vmax=1)
    plt.title('Score Correlation Heatmap')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'score_correlation.png'))
    plt.close()

# Function to create summary statistics visualization
def plot_summary_statistics(df, output_dir):
    score_columns = ['dignity_score', 'christ_centered_score', 'moral_score']
    summary = df[score_columns].describe()
    
    # Create box plots
    plt.figure(figsize=(15, 8))
    
    # First subplot: Box plots
    plt.subplot(1, 2, 1)
    df[score_columns].boxplot()
    plt.title('Score Distributions (Box Plots)')
    plt.ylabel('Score Value')
    plt.xticks(rotation=45)
    
    # Second subplot: Mean and Standard Deviation
    plt.subplot(1, 2, 2)
    x = np.arange(len(score_columns))
    width = 0.35
    
    means = summary.loc['mean']
    stds = summary.loc['std']
    
    plt.bar(x, means, width, yerr=stds, capsize=5, label='Mean ± Std Dev')
    plt.axhline(y=0, color='black', linestyle='-', alpha=0.2)
    
    plt.title('Mean Scores with Standard Deviation')
    plt.xlabel('Score Type')
    plt.ylabel('Score Value')
    plt.xticks(x, [col.replace('_', ' ').title() for col in score_columns], rotation=45)
    
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'summary_statistics_viz.png'))
    plt.close()

def main():
    # Create output directory if it doesn't exist
    output_dir = Path(__file__).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load data
    data_dir = Path(__file__).parent.parent.parent / 'data' / 'book_of_mormon'
    df = load_json_files(data_dir)
    
    # Convert score columns to float
    score_columns = ['dignity_score', 'christ_centered_score', 'moral_score']
    for col in score_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Create visualizations
    plot_score_distributions(df, output_dir)
    plot_average_scores_by_book(df, output_dir)
    plot_score_trends(df, output_dir)
    create_invitation_wordcloud(df, output_dir)
    plot_correlation_heatmap(df, output_dir)
    plot_summary_statistics(df, output_dir)
    
    # Save summary statistics
    summary_stats = df[score_columns].describe()
    summary_stats.to_csv(os.path.join(output_dir, 'summary_statistics.csv'))

if __name__ == "__main__":
    main() 