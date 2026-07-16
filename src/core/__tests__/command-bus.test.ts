import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createCommandBus } from '../command/command-bus.ts'
import { Command } from '../command/command.ts'

class TestCommand extends Command {
  private executed = false
  private undone = false
  private readonly commandName: string

  constructor(commandName: string) {
    super()
    this.commandName = commandName
  }

  execute(): void {
    this.executed = true
  }

  undo(): void {
    this.undone = true
  }

  redo(): void {
    this.executed = true
    this.undone = false
  }

  getDescription(): string {
    return this.commandName
  }

  wasExecuted(): boolean {
    return this.executed
  }

  wasUndone(): boolean {
    return this.undone
  }
}

describe('CommandBus', () => {
  it('should execute command', () => {
    const bus = createCommandBus()
    const cmd = new TestCommand('test')

    bus.execute(cmd)
    assert.strictEqual(cmd.wasExecuted(), true)
    assert.strictEqual(bus.canUndo(), true)
    assert.strictEqual(bus.canRedo(), false)
  })

  it('should undo command', () => {
    const bus = createCommandBus()
    const cmd = new TestCommand('test')

    bus.execute(cmd)
    bus.undo()

    assert.strictEqual(cmd.wasUndone(), true)
    assert.strictEqual(bus.canUndo(), false)
    assert.strictEqual(bus.canRedo(), true)
  })

  it('should redo command', () => {
    const bus = createCommandBus()
    const cmd = new TestCommand('test')

    bus.execute(cmd)
    bus.undo()
    bus.redo()

    assert.strictEqual(cmd.wasExecuted(), true)
    assert.strictEqual(bus.canUndo(), true)
    assert.strictEqual(bus.canRedo(), false)
  })

  it('should clear redo stack on new execute', () => {
    const bus = createCommandBus()
    const cmd1 = new TestCommand('cmd1')
    const cmd2 = new TestCommand('cmd2')

    bus.execute(cmd1)
    bus.undo()
    bus.execute(cmd2)

    assert.strictEqual(bus.canRedo(), false)
    assert.strictEqual(bus.getRedoCount(), 0)
  })

  it('should get history', () => {
    const bus = createCommandBus()
    bus.execute(new TestCommand('first'))
    bus.execute(new TestCommand('second'))

    const history = bus.getHistory()
    assert.strictEqual(history.length, 2)
    assert.strictEqual(history[0], 'first')
    assert.strictEqual(history[1], 'second')
  })

  it('should handle empty undo/redo safely', () => {
    const bus = createCommandBus()

    bus.undo()
    bus.redo()

    assert.strictEqual(bus.canUndo(), false)
    assert.strictEqual(bus.canRedo(), false)
  })

  it('should enforce history limit', () => {
    const bus = createCommandBus()

    for (let i = 0; i < 105; i++) {
      bus.execute(new TestCommand(`cmd-${i}`))
    }

    assert.strictEqual(bus.getUndoCount(), 100)
    assert.strictEqual(bus.getHistory()[0], 'cmd-5')
  })

  it('should clear all commands', () => {
    const bus = createCommandBus()
    bus.execute(new TestCommand('test'))

    bus.clear()

    assert.strictEqual(bus.canUndo(), false)
    assert.strictEqual(bus.canRedo(), false)
    assert.strictEqual(bus.getHistory().length, 0)
  })

  it('should prevent nested execution', () => {
    const bus = createCommandBus()
    const outerCmd = new TestCommand('outer')

    const maliciousCmd = new (class extends Command {
      execute(): void {
        bus.execute(outerCmd)
      }

      undo(): void {}
      redo(): void {}
      getDescription(): string {
        return 'malicious'
      }
    })()

    assert.throws(() => {
      bus.execute(maliciousCmd)
    }, /cannot execute command while another is executing/)
  })
})
