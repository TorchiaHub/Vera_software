import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { X, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  answers: {
    id: string;
    text: string;
    feedback: string;
  }[];
}

interface MonthlyQuestionnaireProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (answers: Record<string, string>) => void;
}

const questionsData: Question[] = [
  {
    id: 'q1',
    question: 'How often do you leave your computer on when not in use?',
    answers: [
      {
        id: 'a1',
        text: 'Always - I never turn it off',
        feedback: 'Consider enabling sleep mode or shutting down when away for extended periods. This could save up to 2-3 bottles worth of energy daily!'
      },
      {
        id: 'a2', 
        text: 'Sometimes - I turn it off overnight',
        feedback: 'Great start! You could save even more by using sleep mode during short breaks throughout the day.'
      },
      {
        id: 'a3',
        text: 'Never - I always turn it off when done',
        feedback: 'Excellent! You\'re already optimizing your energy usage. Keep up the great work!'
      }
    ]
  },
  {
    id: 'q2',
    question: 'What\'s your typical screen brightness level?',
    answers: [
      {
        id: 'b1',
        text: 'Maximum brightness (90-100%)',
        feedback: 'Reducing brightness to 60-70% can significantly lower energy consumption while maintaining comfortable viewing.'
      },
      {
        id: 'b2',
        text: 'Medium brightness (50-70%)',
        feedback: 'Good balance! This level typically provides comfort while being energy efficient.'
      },
      {
        id: 'b3',
        text: 'Low brightness (20-40%)',
        feedback: 'Very energy conscious! Make sure it\'s still comfortable for your eyes and productivity.'
      }
    ]
  },
  {
    id: 'q3',
    question: 'How many applications do you typically run simultaneously?',
    answers: [
      {
        id: 'c1',
        text: 'Many (10+ applications)',
        feedback: 'Consider closing unused applications to reduce CPU and memory usage, saving energy and improving performance.'
      },
      {
        id: 'c2',
        text: 'Moderate (5-10 applications)',
        feedback: 'Reasonable usage! Monitor which apps consume the most resources and close them when not needed.'
      },
      {
        id: 'c3',
        text: 'Few (1-5 applications)',
        feedback: 'Efficient workflow! You\'re minimizing unnecessary energy consumption from background processes.'
      }
    ]
  },
  {
    id: 'q4',
    question: 'Do you use power management settings?',
    answers: [
      {
        id: 'd1',
        text: 'No, I use default settings',
        feedback: 'Customizing power settings can reduce energy use by 15-30%. Try enabling "Balanced" or "Power Saver" mode.'
      },
      {
        id: 'd2',
        text: 'Yes, I use balanced mode',
        feedback: 'Smart choice! Balanced mode provides good performance while managing energy consumption effectively.'
      },
      {
        id: 'd3',
        text: 'Yes, I use power saver mode',
        feedback: 'Excellent! You\'re maximizing energy efficiency. This significantly reduces your environmental impact.'
      }
    ]
  },
  {
    id: 'q5',
    question: 'How important is environmental impact to you?',
    answers: [
      {
        id: 'e1',
        text: 'Not very important',
        feedback: 'Small changes can make a big difference! Even reducing 1 bottle equivalent daily saves 365+ bottles annually.'
      },
      {
        id: 'e2',
        text: 'Somewhat important',
        feedback: 'Great mindset! Your awareness is the first step toward making a positive environmental impact.'
      },
      {
        id: 'e3',
        text: 'Very important',
        feedback: 'Fantastic! Your commitment to environmental responsibility makes a real difference. Keep leading by example!'
      }
    ]
  }
];

export function MonthlyQuestionnaire({ isOpen, onClose, onComplete }: MonthlyQuestionnaireProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    const question = questionsData[currentQuestion];
    const selectedAnswer = question.answers.find(a => a.id === answerId);
    
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    
    if (selectedAnswer) {
      setCurrentFeedback(selectedAnswer.feedback);
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowFeedback(false);
      setCurrentFeedback('');
    } else {
      setIsCompleted(true);
      onComplete(answers);
    }
  };

  const handleClose = () => {
    if (isCompleted || Object.keys(answers).length === questionsData.length) {
      onClose();
    }
  };

  const currentQ = questionsData[currentQuestion];
  const selectedAnswer = answers[currentQ.id];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-purple-50 border-purple-200 border-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Monthly Environmental Questionnaire</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Question {currentQuestion + 1} of {questionsData.length}
            </p>
          </div>
          {isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isCompleted ? (
            <>
              <div className="space-y-4">
                <h3 className="font-medium">{currentQ.question}</h3>
                
                <RadioGroup
                  value={selectedAnswer}
                  onValueChange={(value) => handleAnswerSelect(currentQ.id, value)}
                >
                  {currentQ.answers.map((answer) => (
                    <div key={answer.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={answer.id} id={answer.id} />
                      <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                        {answer.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {showFeedback && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">{currentFeedback}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Progress: {currentQuestion + 1}/{questionsData.length}
                </div>
                
                <Button
                  onClick={handleNext}
                  disabled={!selectedAnswer}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {currentQuestion === questionsData.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h3 className="font-medium">Thank you for your feedback!</h3>
              <p className="text-sm text-muted-foreground">
                Your responses help us understand usage patterns and provide better environmental insights.
              </p>
              <p className="text-xs text-muted-foreground">
                Data collected anonymously • CMU: ITLO000001
              </p>
              <Button onClick={handleClose} className="bg-purple-600 hover:bg-purple-700">
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}