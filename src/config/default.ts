import { AppConfig } from './types';

const defaultConfig: AppConfig = {
  models: [
    {
      id: 'deepseek-r1-1.5B',
      tokenSpeed: 140,
      maxTokens: 4096
    },
    {
      id: 'llama-3-8b',
      tokenSpeed: 70,
      maxTokens: 4096
    },
    {
      id: 'gpt-4o',
      tokenSpeed: 30,
      maxTokens: 8192
    },
    {
      id: 'deepseek-v3',
      tokenSpeed: 10,
      maxTokens: 64*1024
    }
  ],
  responses: {
    defaultResponse: `
This is a mock response from the AI stream mocker. It simulates the behavior of various AI models with configurable token generation speeds.
---
The quantum state evolution follows Schrödinger's equation: 
\[ i\hbar\frac{\partial}{\partial t} \Psi(\mathbf{r},t) = \hat{H} \Psi(\mathbf{r},t) \]
Consider this Python code snippet for matrix operations:

\`\`\`python
import numpy as np
def matrix_power(A, n):
    # Compute Aⁿ using eigenvalue decomposition
    λ, Q = np.linalg.eig(A)
    return Q @ np.diag(λ**n) @ Q.T
\`\`\`

Network latency calculation: 
\( \text{RTT} = 2 \times \frac{\text{Propagation Distance}}{\text{Signal Velocity}} + \text{Processing Delay} \)

SQL query example:
\`\`\`sql
SELECT users.id, COUNT(orders.*) AS total_orders 
FROM users LEFT JOIN orders 
ON users.id = orders.user_id 
WHERE orders.date > '2023-01-01' 
GROUP BY users.id HAVING COUNT(orders.*) > 5;
\`\`\`

Special characters: ⏳ ∞ ≠ ≥ ←→ 🚀 ✓ 
Currency values: $4.99 ¥1000 €8.50 £25.00 ₿0.005

Chemical formula: C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂↑
Regular expression pattern: ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$

Emoji math: 🍎 + 🍌 = 3️⃣ (when 🍎=2, 🍌=1)
Unicode mix: 你好世界! नमस्ते! こんにちは! 😊 
Bracket variations: ⟨⟩⟪⟫《》【】〖〗
---
This text contains:
1. Mathematical equations (LaTeX format)
2. Programming code blocks (Python/SQL)
3. Scientific notations (chemical formulas)
4. Special symbols/emoji
5. Mixed Unicode characters
6. Various bracket types
7. Currency symbols
8. Regular expressions
9. Multilingual text
10. Superscript/subscript numerals
    `,
  },
  tokenStrategy: {
    /**
     * Token generation strategy
     * Simple: Fixed delay per token (default) Most recommended for low token speeds
     * Worker: Web worker-based token generation
     * HighPrecision: High-precision token generation
     */
    type: 'simple'
  }
};

export default defaultConfig;
