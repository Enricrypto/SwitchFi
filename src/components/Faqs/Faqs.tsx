import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'

const faqs = [
  {
    question: 'What is SwitchFi, and how is it different from Uniswap?',
    answer:
      'SwitchFi is your no-code gateway to DeFi. It works like Uniswap under the hood (we use the same V2 model), but with a slicker UI, token minting tools, and a smoother multi-hop swap experience. Built for speed, simplicity, and clarity — without losing the power of on-chain liquidity.',
  },
  {
    question: 'Why do I need to mint tokens first?',
    answer:
      'If you’re testing on a devnet or local setup, minting test tokens (like TKNA or TKNB) lets you simulate trades and liquidity pools. Think of it as printing play money — just for your wallet. On mainnet, you’d use real tokens instead.',
  },
  {
    question: 'Can I create a pool for any two tokens?',
    answer:
      'Yup! Pick any two ERC-20 tokens (just not the same one twice). If the pool doesn’t already exist, we’ll create a brand-new one for you on-chain. If it does exist, we’ll let you know so you don’t duplicate it.',
  },
  {
    question: 'What’s a multi-hop swap and why should I care?',
    answer:
      'Multi-hop swaps let you trade tokens even if no direct pool exists — for example, DAI → USDC → WETH. We automatically find the best path (and lowest slippage) using existing pools. You get the tokens you want, with optimized routing, all in one click.',
  },
  {
    question: 'My transaction failed — what happened?',
    answer:
      'It could be a few things:\n- Your wallet wasn’t connected ✅\n- You didn’t approve tokens for swapping 🧾\n- You selected the same token for both A and B 🚫\n- Gas fees spiked or slippage was too low ⛽\n\nCheck your wallet for errors or retry with higher slippage tolerance!',
  },
]

export  function Faqs() {
  return (
    <div className="bg-transparent">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Frequently asked questions</h2>
          <dl className="mt-16 divide-y divide-white/10">
            {faqs.map((faq) => (
              <Disclosure key={faq.question} as="div" className="py-6 first:pt-0 last:pb-0">
                <dt>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-white">
                    <span className="text-base/7 font-semibold">{faq.question}</span>
                    <span className="ml-6 flex h-7 items-center">
                      <PlusSmallIcon aria-hidden="true" className="size-6 group-data-open:hidden" />
                      <MinusSmallIcon aria-hidden="true" className="size-6 group-not-data-open:hidden" />
                    </span>
                  </DisclosureButton>
                </dt>
                <DisclosurePanel as="dd" className="mt-2 pr-12 whitespace-pre-line">
                  <p className="text-base/7 text-gray-300">{faq.answer}</p>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
